import {HttpException, Injectable, Logger} from '@nestjs/common';
import {SpotifyService} from '../../../spotify/spotify/spotify.service';
import {
  AudioFeaturesObject,
  CreatePlaylistResponse,
  Diff,
  DiffIdentifier,
  EpisodeObjectFull,
  ListOfUsersPlaylistsResponse,
  PlaylistTrackObject,
  PlaylistTrackResponse,
  SinglePlaylistResponse,
  SyncPlaylistResult,
  TrackObjectFull
} from '@spotify-manager/core';
import _ from 'lodash';
import {PlaylistHistoryService} from '../playlist-history/playlist-history.service';
import {PlaylistRemixEntity} from '../../entities/playlist-remix.entity';
import {environment} from '../../../../../environments/environment';
import {UserPreferencesService} from '../../../user-preferences/services/user-preferences.service';

@Injectable()
export class PlaylistService {
  /**
   * Inject dependencies
   * @param spotifyService
   * @param historyService
   */
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly historyService: PlaylistHistoryService) {
  }

  /**
   * Creates a new playlist and songs from the given playlist are copied to the new playlist.
   * The songs in the original playlist are saved in the database, so it can be used to sync the remixed playlist with the original one later.
   *
   * An additional parameter is added to exclude this playlist when checking if the original playlist has changed (only in jobs generating notifications).
   * This is because some playlists are personalized playlists created by Spotify.
   * @param  playlistid
   * @param ignoreNotifications
   */
  public async remixPlaylist(playlistid: string, ignoreNotifications: boolean): Promise<CreatePlaylistResponse> {
    Logger.log(`Creating new remix playlist for playlist ${playlistid}`);
    const me = this.spotifyService.getCurrentUser();
    const originalPlaylist = await this.getPlaylistWithAllTracks(playlistid);

    let newPlaylistName = originalPlaylist.name;
    if (!environment.production) {
      newPlaylistName = `Local Remix - ${newPlaylistName}`;
    } else {
      newPlaylistName = `Remix - ${newPlaylistName}`;
    }

    // Somehow the spotify API does not always add the description properly. So we keep track of the expected description.
    // If the actual description does not match the expected description, we will update the playlist with the expected description.
    const expectedDescription = `This playlist has been remixed using SpotifyManager. Please do not remove the original playlist id from the description. Original playlist: {${originalPlaylist.id}}`;
    const newPlaylist = await this.spotifyService.createPlaylist(newPlaylistName, {
      description: expectedDescription
    });
    let actualDescription = newPlaylist.description;
    let retries = 0;
    while (actualDescription != expectedDescription) {
      Logger.warn(
        `Description was not set properly for playlist ${newPlaylist.id}. Retrying...`
      );
      // Sadly the spotify API does not return the updated playlist object.. so we need to fetch it again.
      await this.spotifyService.changePlaylistDetails(newPlaylist.id, {
        description: expectedDescription
      });
      const changedPlaylist = await this.spotifyService.getPlaylistInformation(newPlaylist.id);
      actualDescription = changedPlaylist.description;
      retries++;

      if (retries > 20) {
        // Try to remove the empty remixed playlist we can't set the description for
        await this.spotifyService.removePlaylist(newPlaylist.id);
        throw new HttpException(
          `Could not set description for playlist. Please retry`,
          500
        );
      }
    }

    Logger.log(`Created new remix playlist with id ${newPlaylist.id} for original playlist ${playlistid}`);
    Logger.log(`Creating took ${retries} retries.`);

    Logger.log(`Adding all tracks to the new playlist ${newPlaylist.id}`)
    await this.spotifyService.addTracksToPlaylist(newPlaylist.id, originalPlaylist.tracks.items.map((track) => track.track.uri));

    Logger.log(`Added all ${originalPlaylist.tracks.items.length} tracks to the new playlist ${newPlaylist.id}`);

    const playlistDefinition = new PlaylistRemixEntity(originalPlaylist.id, newPlaylist.id, me.id, new Date(), originalPlaylist.tracks.items.map(track => track.track.id));
    await this.historyService.recordPlaylistDefinition(playlistDefinition);


    // If the user wants to ignore notifications for the remixed playlist, we will add this playlist to the list of playlists to ignore in his user preferences
    if (ignoreNotifications) {
      await this.userPreferencesService.addPlaylistToIgnoreList(me.id, newPlaylist.id);
    }
    return newPlaylist;
  }

  /**
   * Get the playlist with all the tracks in it.
   * @param playlistid
   * @private
   */
  private async getPlaylistWithAllTracks(playlistid: string) {
    const originalPlaylist = await this.spotifyService.getPlaylistInformation(playlistid);
    originalPlaylist.tracks.items = (
      await this.spotifyService.getAllSongsInPlaylist(playlistid)
    ).items;
    return originalPlaylist;
  }

  /**
   * Get all the playlists that belong to the user that belongs to the given access token.
   */
  async getAllUserPlaylists(userid?: string): Promise<ListOfUsersPlaylistsResponse> {
    const playlists = await this.spotifyService.getUserPlaylists(userid);

    while (playlists.next != null) {
      const morePlaylists = (await this.spotifyService.getGeneric(playlists.next)) as ListOfUsersPlaylistsResponse;
      playlists.next = morePlaylists.next;
      playlists.items = playlists.items.concat(morePlaylists.items);
    }

    return playlists;
  }

  /**
   * Get a single playlist by id.
   * @param  playlistid
   */
  async getPlaylist(playlistid: string): Promise<SinglePlaylistResponse> {
    return this.spotifyService.getPlaylistInformation(playlistid);
  }

  /**
   * Remove all the songs in the given playlist and put the given tracks in the playlist.
   * @param remixedPlaylistId - The ID of the remixed playlist
   * @param tracks - Tracks the remixed playlist should contain after syncing is complete
   */
  async syncPlaylist(remixedPlaylistId: string, tracks: (TrackObjectFull | EpisodeObjectFull)[]): Promise<SyncPlaylistResult> {
    const userId = this.spotifyService.getCurrentUser().id;
    const originalPlaylistId = (await this.historyService.getPlaylistDefinition(remixedPlaylistId, userId)).originalPlaylistId;
    const tracksInOriginalPlaylistNow = await this.spotifyService.getAllSongsInPlaylist(originalPlaylistId);

    // Playlist definition of the original playlist at the time of syncing (now)
    const originalPlaylistDefinition = new PlaylistRemixEntity(
      originalPlaylistId,
      remixedPlaylistId,
      userId,
      new Date(),
      tracksInOriginalPlaylistNow.items.map(track => track.track.id)
    );
    // Update the original playlist definition in the database
    await this.historyService.recordPlaylistDefinition(originalPlaylistDefinition);

    // Remove all the tracks in the playlist.
    const tracksToDeleteFromRemix = await this.spotifyService.getAllSongsInPlaylist(remixedPlaylistId);
    await this.spotifyService.removeTracksFromPlaylist(remixedPlaylistId, tracksToDeleteFromRemix.items.map((track) => track.track));
    // And only add the tracks back in that we want to keep.
    await this.spotifyService.addTracksToPlaylist(remixedPlaylistId, tracks.map((track) => track.uri));

    return {
      amountOfSongsInSyncedPlaylist: tracks.length
    };
  }

  /**
   * Get all remixed playlists for a user, that are also recorded in the database.
   * We filter out playlists that are not remixed by this application instance, because we don't have the original playlist definition for those, resulting in errors down the line.
   * This is because the production environment uses the same Spotify account as when you are developing the application.
   */
  async getRemixedPlaylists(userid?: string): Promise<ListOfUsersPlaylistsResponse> {
    const playlists = await this.getAllUserPlaylists(userid);

    if (!userid) {
      userid = this.spotifyService.getCurrentUser().id;
    }

    const playlistDefinitions = await this.historyService.getPlaylistDefinitionsForUser(userid);
    const remixedPlaylistIds = playlistDefinitions.map(definition => definition.remixPlaylistId);

    playlists.items = playlists.items.filter(playlist => remixedPlaylistIds.includes(playlist.id));
    return playlists;
  }

  /**
   * Compares the current state of the original playlist and the remixed playlist with the state of the original playlist at the time of remixing.
   *
   * This method is used to identify the differences between the original playlist at the time of remixing, the current state of the original playlist, and the remixed playlist.
   * The differences are categorized as follows:
   * - Songs that were in the original playlist at the time of remixing but have been removed in the current original playlist are marked as 'removed-in-original'.
   * - Songs that are present in all three states (original at remix, original now, and remixed now) are marked as 'unchanged'.
   * - Songs that were in the original playlist and the remixed playlist at the time of remixing but have been removed in the current remixed playlist are marked as 'removed-in-remix'.
   * - Songs that have been added to the original playlist after remixing are marked as 'added-in-original'.
   * - Songs that have been added to the remixed playlist after remixing are marked as 'added-in-remix'.
   * - Songs that have been added to both the original and remixed playlist after remixing are marked as 'added-in-both'.
   * - Songs that are removed from both the original and remixed playlist after remixing will not be included in the result.
   *
   * @param {string} remixedPlaylistId - The ID of the remixed playlist.
   * @param userId
   * @returns {Promise<Diff[]>} - A promise that resolves to an array of differences between the playlists.
   *
   * @example
   * // Original Playlist at Remix: ['Song A', 'Song B', 'Song C', 'Song D', 'Song E']
   * // Original Playlist Now: ['Song B', 'Song C', 'Song F', 'Song D', 'Song E']
   * // Remixed Playlist Now: ['Song A', 'Song B', 'Song D', 'Song G', 'Song E']
   *
   * compareRemixedPlaylistWithOriginal('originalPlaylistId', 'remixedPlaylistId');
   *
   * // Returns: [['removed-in-original', 'Song A'], ['unchanged', 'Song B'], ['removed-in-remix', 'Song C'], ['unchanged', 'Song D'], ['unchanged', 'Song E'], ['added-in-original', 'Song F'], ['added-in-remix', 'Song G']]
   */
  async compareRemixedPlaylistWithOriginal(remixedPlaylistId: string, userId?: string): Promise<Diff[]> {
    // Step 1: Fetch all required data.
    // The current user, the original playlist at the time of remixing, the current state of the original playlist, and the current state of the remixed playlist.
    // userId is not provided when this method is called from the frontend, we use the current user in that case.
    if (!userId) {
      userId = this.spotifyService.getCurrentUser().id;
    }

    const originalPlaylistAtLastSync = (await this.historyService.getPlaylistDefinition(remixedPlaylistId, userId));
    if (!originalPlaylistAtLastSync) {
      throw new HttpException('No playlist definition found for the given playlists', 404);
    }

    const originalPlaylistTrackIdsAtLastSync = originalPlaylistAtLastSync.originalPlaylistTrackIds;

    const originalPlaylistNow = await this.spotifyService.getAllSongsInPlaylist(originalPlaylistAtLastSync.originalPlaylistId);
    const remixedPlaylistNow = await this.spotifyService.getAllSongsInPlaylist(remixedPlaylistId);

    // Step 2: Map the tracks to only their ID's, so we can easily compare (simple strings are easier to compare than full objects)
    const originalTrackIdsNow = originalPlaylistNow.items.map(track => track.track.id);
    const remixedTrackIdsNow = remixedPlaylistNow.items.map(track => track.track.id);

    // Step 3: Create a hashmap of all these tracks so we can easily look up the entire track object by its ID
    const tracksHashmap = new Map<string, PlaylistTrackObject>();
    originalPlaylistNow.items.forEach(track => tracksHashmap.set(track.track.id, track));
    remixedPlaylistNow.items.forEach(track => tracksHashmap.set(track.track.id, track));

    // Step 4: Calculate the differences between the playlists
    const removedInOriginal = _.difference(originalPlaylistTrackIdsAtLastSync, originalTrackIdsNow);
    const addedInOriginal = _.difference(originalTrackIdsNow, originalPlaylistTrackIdsAtLastSync);
    const removedInRemix = _.difference(originalPlaylistTrackIdsAtLastSync, remixedTrackIdsNow);
    const addedInRemix = _.difference(remixedTrackIdsNow, originalPlaylistTrackIdsAtLastSync);
    const unchanged = _.intersection(originalPlaylistTrackIdsAtLastSync, remixedTrackIdsNow, originalTrackIdsNow);

    const diff = [];
    removedInOriginal.filter(removedId => tracksHashmap.has(removedId)).forEach((trackId: string) => diff.push([DiffIdentifier.REMOVED_IN_ORIGINAL, tracksHashmap.get(trackId)]));
    addedInOriginal.forEach((trackId: string) => {
      // If this track is also added in the remixed playlist, we will actually mark this track as added in both.
      if (addedInRemix.includes(trackId)) {
        diff.push([DiffIdentifier.ADDED_IN_BOTH, tracksHashmap.get(trackId)]);
      } else {
        diff.push([DiffIdentifier.ADDED_IN_ORIGINAL, tracksHashmap.get(trackId)]);
      }
    });
    removedInRemix.filter(removedId => tracksHashmap.has(removedId)).forEach((trackId: string) => diff.push([DiffIdentifier.REMOVED_IN_REMIX, tracksHashmap.get(trackId)]));
    addedInRemix.forEach((trackId: string) => {
      // If the track is also added in the original playlist, we already marked it as added in both so we skip it here.
      // All other tracks are added as 'added in remix'.
      if (!addedInOriginal.includes(trackId)) {
        diff.push([DiffIdentifier.ADDED_IN_REMIX, tracksHashmap.get(trackId)]);
      }
    });
    unchanged.forEach((trackId: string) => diff.push([DiffIdentifier.UNCHANGED, tracksHashmap.get(trackId)]));

    return diff;
  }

  /**
   * Returns the original playlist definition given the playlist ID of a remixed playlist.
   * @param playlistId
   */
  async getOriginalPlaylistForRemix(playlistId: string) {
    const userId = this.spotifyService.getCurrentUser().id;
    const playlistDefinition = await this.historyService.getPlaylistDefinition(playlistId, userId);
    if (!playlistDefinition) {
      throw new HttpException('No playlist definition found for the given playlist', 404);
    }
    return this.getPlaylist(playlistDefinition.originalPlaylistId);
  }

  /**
   * Get the playlist with all tracks and their audio features.
   * Then, reorder the playlist using Euclidean distance to ensure smooth transitions.
   * @param {string} playlistid - The ID of the playlist to reorder.
   * @returns {Promise<any>} - The reordered playlist.
   */
  async getDJModePlaylist(playlistid: string): Promise<any> {
    const playlist = await this.spotifyService.getAllSongsInPlaylist(playlistid);
    const trackIds = playlist.items.map((track) => track.track.id);
    const audioFeatures = await this.spotifyService.getAudioAnalysisForTracks(trackIds);

    return this.orderPlaylistBySmoothTransitions(playlist.items, audioFeatures);
  }

  /**
   * Reorders the playlist based on Euclidean distance between audio features of tracks.
   * @param tracks - List of tracks in the playlist.
   * @param audioFeatures - Corresponding audio features for each track.
   * @returns An ordered list of tracks with corresponding audio features and score.
   */
  private orderPlaylistBySmoothTransitions(
    tracks: PlaylistTrackObject[],
    audioFeatures: AudioFeaturesObject[]
  ): { track: TrackObjectFull | EpisodeObjectFull; audioFeatures: AudioFeaturesObject; score: number }[] {
    // Create a map of track IDs to their audio features
    const audioFeaturesMap: Map<string, AudioFeaturesObject> = new Map();
    audioFeatures.forEach((audioFeature) => {
      audioFeaturesMap.set(audioFeature.id, audioFeature);
    });

    // Start by selecting a random track, then iteratively add the closest track based on Euclidean distance
    const orderedTracks: { track: PlaylistTrackObject, distance: number }[] = [];
    const remainingTracks = [...tracks];
    let currentTrack = remainingTracks.shift();
    orderedTracks.push({ track: currentTrack, distance: 0 });

    while (remainingTracks.length > 0) {
      const [distance, closestTrack] = this.findClosestTrack(currentTrack.track.id, remainingTracks, audioFeaturesMap);
      orderedTracks.push({ track: closestTrack, distance });
      currentTrack = closestTrack;
      remainingTracks.splice(remainingTracks.indexOf(closestTrack), 1);
    }

    return orderedTracks.map(({ track, distance }) => {
      return {
        track: track.track,
        audioFeatures: audioFeaturesMap.get(track.track.id),
        score: distance,
      };
    });
  }

  /**
   * Finds the track closest to the current one based on Euclidean distance.
   * @param {string} currentTrackId - ID of the current track.
   * @param {PlaylistTrackObject[]} remainingTracks - The tracks that are still to be ordered.
   * @param {Map<string, AudioFeaturesObject>} audioFeaturesMap - Map of track IDs to their audio features.
   * @returns {[number, PlaylistTrackObject]} - A tuple containing the distance and the closest track.
   */
  private findClosestTrack(currentTrackId: string, remainingTracks: PlaylistTrackObject[], audioFeaturesMap: Map<string, AudioFeaturesObject>): [number, PlaylistTrackObject] {
    let closestTrack: PlaylistTrackObject = null;
    let closestDistance = Infinity;

    const currentTrackFeatures = audioFeaturesMap.get(currentTrackId);
    remainingTracks.forEach((track) => {
      const distance = this.calculateEuclideanDistance(currentTrackFeatures, audioFeaturesMap.get(track.track.id));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTrack = track;
      }
    });

    return [closestDistance, closestTrack];
  }

  /**
   * Calculates the Euclidean distance between two sets of audio features.
   * @param {AudioFeaturesObject} trackA - Audio features of the first track.
   * @param {AudioFeaturesObject} trackB - Audio features of the second track.
   * @returns {number} - The Euclidean distance between the two tracks.
   */
  private calculateEuclideanDistance(trackA: AudioFeaturesObject, trackB: AudioFeaturesObject): number {
    const featuresA = [
      trackA.acousticness,
      trackA.danceability,
      trackA.energy,
      trackA.instrumentalness,
      trackA.liveness,
      trackA.loudness,
      trackA.speechiness,
      trackA.valence,
      trackA.tempo,
    ];

    const featuresB = [
      trackB.acousticness,
      trackB.danceability,
      trackB.energy,
      trackB.instrumentalness,
      trackB.liveness,
      trackB.loudness,
      trackB.speechiness,
      trackB.valence,
      trackB.tempo,
    ];

    // Calculate the Euclidean distance between the two feature vectors
    return Math.sqrt(
      featuresA.reduce((sum, featureA, index) => {
        const featureB = featuresB[index];
        return sum + Math.pow(featureA - featureB, 2);
      }, 0)
    );
  }

  /**
   * Apply the suggested sorting to the playlist.
   * @param playlistid
   * @param sortedTracksUris
   */
  async applySorting(playlistid: string, sortedTracksUris: string[]): Promise<void> {
    await this.spotifyService.reorderPlaylist(playlistid, sortedTracksUris);
  }
}
