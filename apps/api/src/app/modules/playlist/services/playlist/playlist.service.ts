import { HttpException, Injectable, Logger } from '@nestjs/common';
import { SpotifyService } from '../../../spotify/spotify.service';
import {
  CreatePlaylistResponse,
  Diff,
  EpisodeObjectFull,
  ListOfUsersPlaylistsResponse,
  PlaylistTrackObject,
  PlaylistTrackResponse,
  SinglePlaylistResponse,
  SyncPlaylistResult,
  TrackObjectFull
} from '@spotify-manager/core';
import _ from 'lodash';
import { PlaylistHistoryService } from '../playlist-history/playlist-history.service';

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
    Logger.log(
      `Playlist ${playlistid} has ${response.total} tracks total. (${amountOfChunks} chunks of 100 songs.)`
    );
    for (let i = 1; i < amountOfChunks; i++) {
      Logger.log(
        `Loading chunk ${i}/${amountOfChunks} for playlist ${playlistid}`
      );
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
  public async remixPlaylist(
    playlistid: string
  ): Promise<CreatePlaylistResponse> {
    Logger.log(`Creating new remix playlist for playlist ${playlistid}`);
    const originalPlaylist = await this.getPlaylistWithAllTracks(playlistid);

    const newPlaylistName = `Remix - ${originalPlaylist.name}`;
    // Somehow the spotify API does not always add the description properly. So we keep track of the expected description.
    // If the actual description does not match the expected description, we will update the playlist with the expected description.
    const expectedDescription = `This playlist has been remixed using SpotifyManager. Please do not remove the original playlist id from the description. Original playlist: {${originalPlaylist.id}}`;
    const newPlaylist = await this.spotifyService.createPlaylist(
      newPlaylistName,
      {
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
      const changedPlaylist = await this.spotifyService.getPlaylistInformation(
        newPlaylist.id
      );
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

    Logger.log(
      `Created new remix playlist with id ${newPlaylist.id} for original playlist ${playlistid}`
    );
    Logger.log(`Creating took ${retries} retries.`);

    // Add all the tracks of the original playlist to the new playlist.
    await this.spotifyService.addTracksToPlaylist(
      newPlaylist.id,
      originalPlaylist.tracks.items.map((track) => track.track.uri)
    );

    Logger.log(`Added all tracks to the new playlist ${newPlaylist.id}`)

    await this.historyService.recordPlaylistDefinition(originalPlaylist, newPlaylist.id);
    return newPlaylist;
  }

  /**
   * Get the playlist with all the tracks in it.
   * @param playlistid
   * @private
   */
  private async getPlaylistWithAllTracks(playlistid: string) {
    const originalPlaylist = await this.spotifyService.getPlaylistInformation(
      playlistid
    );
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
      const morePlaylists = (await this.spotifyService.getGeneric(
        playlists.next
      )) as ListOfUsersPlaylistsResponse;
      playlists.next = morePlaylists.next;
      playlists.items = playlists.items.concat(morePlaylists.items);
    }

    return playlists;
  }

  /**
   * Get a single playlist by id.
   * @param  playlistid
   */
  async getPlaylist(
    playlistid: string
  ): Promise<SinglePlaylistResponse> {
    return this.spotifyService.getPlaylistInformation(playlistid);
  }

  /**
   * Compare a playlist to another.
   * @param basePlaylistId
   * @param comparePlaylistId
   */
  async comparePlaylist(
    basePlaylistId: string,
    comparePlaylistId: string
  ): Promise<Diff[]> {
    const basePlaylistResponse = await this.getAllSongsInPlaylist(basePlaylistId);
    const comparePlaylistResponse = await this.getAllSongsInPlaylist(comparePlaylistId);

    return this.calculateChanges(basePlaylistResponse.items, comparePlaylistResponse.items);
  }

  /**
   * Calculate the difference between two playlists.
   * Returns a two-dimensional array containing each song decorated with a number.
   * The number indicates if the song is added(1), removed(-1) or unchanged(0).
   * Example: [[0, track], [-1, track], [1, track]]
   *
   * The changes are calculated like this:
   * 1. Check if the song is in both playlists. If so, it's a 0.
   * 2. If the song is only present in the base playlist, it's a 1.
   * 3. If the song is only present in the other playlist, it's a -1.
   * @param primary
   * @param secondary
   */
  private calculateChanges(
    primary: PlaylistTrackObject[],
    secondary: PlaylistTrackObject[]
  ): Diff[] {
    const addedTracks = _.differenceWith(primary, secondary, _.isEqual).map(track => [1, track]);
    const removedTracks = _.differenceWith(secondary, primary, _.isEqual).map(track => [-1, track]);
    const unchangedTracks = _.intersectionWith(primary, secondary, _.isEqual).map(track => [0, track]);

    return [...addedTracks, ...removedTracks, ...unchangedTracks];
  }

  /**
   * Remove all the songs in the given playlist and put the given tracks in the playlist.
   * @param remixedPlaylistId
   * @param tracks
   */
  async syncPlaylist(
    remixedPlaylistId: string,
    tracks: (TrackObjectFull | EpisodeObjectFull)[]
  ): Promise<SyncPlaylistResult> {
    // Get all tracks in the playlist.
    const tracksInPlaylist = await this.getAllSongsInPlaylist(remixedPlaylistId);

    // Remove all the tracks in the playlist.
    await this.spotifyService.removeTracksFromPlaylist(remixedPlaylistId, tracksInPlaylist.items.map((track) => track.track));
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
    const originalPlaylistNow = await this.getAllSongsInPlaylist(originalPlaylistId);
    const originalPlaylistAtTimeOfLastSync = await this.historyService.getPlaylistDefinition(originalPlaylistId);
    const remixedPlaylistNow = await this.getAllSongsInPlaylist(remixedPlaylistId);


    return [];
  }
}
