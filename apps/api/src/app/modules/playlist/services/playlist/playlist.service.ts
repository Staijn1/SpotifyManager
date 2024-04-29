import { HttpException, Injectable, Logger } from '@nestjs/common';
import { SpotifyService } from '../../../spotify/spotify.service';
import {
  CreatePlaylistResponse,
  Diff,
  DiffIdentifier,
  EpisodeObjectFull,
  ListOfUsersPlaylistsResponse,
  PlaylistTrackObject,
  PlaylistTrackResponse,
  SinglePlaylistResponse,
  SyncPlaylistResult,
  TrackObjectFull,
} from '@spotify-manager/core';
import _ from 'lodash';
import { PlaylistHistoryService } from '../playlist-history/playlist-history.service';
import { PlaylistRemixEntity } from '../../entities/playlist-remix.entity';

@Injectable()
export class PlaylistService {
  /**
   * Inject dependencies
   * @param spotifyService
   * @param historyService
   */
  constructor(private readonly spotifyService: SpotifyService, private readonly historyService: PlaylistHistoryService) {
  }

  /**
   * The spotify API returns only the first 100 tracks in a playlist.
   * This method will loop through the playlist and get the tracks in chunks of 100, and then return all the tracks.
   * @param playlistid
   */
  public async getAllSongsInPlaylist(
    playlistid: string
  ): Promise<PlaylistTrackResponse> {
    Logger.log(`Getting all songs in playlist ${playlistid}`);
    const response = await this.spotifyService.getTracksInPlaylist(playlistid);
    const amountOfChunks = Math.ceil(response.total / 100);
    Logger.log(`Playlist ${playlistid} has ${response.total} tracks total. (${amountOfChunks} chunks of 100 songs.)`);
    for (let i = 1; i < amountOfChunks; i++) {
      Logger.log(`Loading chunk ${i}/${amountOfChunks} for playlist ${playlistid}`);
      const options = {
        offset: i * 100
      };
      const tracks = await this.spotifyService.getTracksInPlaylist(
        playlistid,
        options
      );
      response.items = response.items.concat(tracks.items);
    }
    Logger.log(`Finished loading all songs in playlist ${playlistid}`);
    return response;
  }

  /**
   * Creates a new playlist and songs from the given playlist are copied to the new playlist.
   * The songs in the original playlist are saved in the database, so it can be used to sync the remixed playlist with the original one later.
   * @param  playlistid
   */
  public async remixPlaylist(playlistid: string): Promise<CreatePlaylistResponse> {
    Logger.log(`Creating new remix playlist for playlist ${playlistid}`);
    const me = await this.spotifyService.getMe();
    const originalPlaylist = await this.getPlaylistWithAllTracks(playlistid);

    const newPlaylistName = `Remix - ${originalPlaylist.name}`;
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

    // Add all the tracks of the original playlist to the new playlist.
    await this.spotifyService.addTracksToPlaylist(
      newPlaylist.id,
      originalPlaylist.tracks.items.map((track) => track.track.uri)
    );

    Logger.log(`Added all tracks to the new playlist ${newPlaylist.id}`);

    const playlistDefinition = new PlaylistRemixEntity(originalPlaylist.id, newPlaylist.id, me.id, new Date(), originalPlaylist.tracks.items.map(track => track.track.id));
    await this.historyService.recordPlaylistDefinition(playlistDefinition);
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
      await this.getAllSongsInPlaylist(playlistid)
    ).items;
    return originalPlaylist;
  }

  /**
   * Get all the playlists that belong to the user that belongs to the given access token.
   */
  async getAllUserPlaylists(): Promise<ListOfUsersPlaylistsResponse> {
    const playlists = await this.spotifyService.getUserPlaylists();

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
    const tracksToDeleteFromRemix = await this.getAllSongsInPlaylist(remixedPlaylistId);
    const currentRemixedPlaylist = await this.getPlaylistWithAllTracks(remixedPlaylistId);
    const userId = (await this.spotifyService.getMe()).id;
    const playlistDefinition = new PlaylistRemixEntity(
      currentRemixedPlaylist.id,
      remixedPlaylistId,
      userId,
      new Date(),
      currentRemixedPlaylist.tracks.items.map(track => track.track.id)
    );
    // Update the original playlist definition in the database
    await this.historyService.recordPlaylistDefinition(playlistDefinition);

    // Remove all the tracks in the playlist.
    await this.spotifyService.removeTracksFromPlaylist(remixedPlaylistId, tracksToDeleteFromRemix.items.map((track) => track.track));
    await this.spotifyService.addTracksToPlaylist(remixedPlaylistId, tracks.map((track) => track.uri));

    return {
      amountOfSongsInSyncedPlaylist: tracks.length
    };
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
   * @param {string} originalPlaylistId - The ID of the original playlist.
   * @param {string} remixedPlaylistId - The ID of the remixed playlist.
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
  async compareRemixedPlaylistWithOriginal(originalPlaylistId: string, remixedPlaylistId: string): Promise<Diff[]> {
    // Step 1: Fetch all required data.
    // The current user, the original playlist at the time of remixing, the current state of the original playlist, and the current state of the remixed playlist.
    const me = await this.spotifyService.getMe();
    const originalPlaylistTrackIdsAtLastSync = (await this.historyService.getPlaylistDefinition(originalPlaylistId, remixedPlaylistId, me.id))?.originalPlaylistTrackIds;

    if (!originalPlaylistTrackIdsAtLastSync) {
      throw new HttpException('No playlist definition found for the given playlists', 404);
    }

    const originalPlaylistNow = await this.getAllSongsInPlaylist(originalPlaylistId);
    const remixedPlaylistNow = await this.getAllSongsInPlaylist(remixedPlaylistId);

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
}
