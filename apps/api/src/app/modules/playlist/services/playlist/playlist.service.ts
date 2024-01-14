import {HttpException, Injectable, Logger} from '@nestjs/common';
import {SpotifyService} from '../../../spotify/spotify.service';
import {PlaylistFileService} from '../playlist-file-service/playlist-file.service';
import {
  CreatePlaylistResponse, Diff,
  EpisodeObjectFull, ListOfUsersPlaylistsResponse,
  PlaylistTrackObject,
  PlaylistTrackResponse, RemixedPlaylistInformation,
  SinglePlaylistResponse,
  TrackObjectFull
} from '@spotify-manager/core';

@Injectable()
export class PlaylistService {
  /**
   * Inject dependencies
   * @param spotifyService
   * @param fileService
   */
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly fileService: PlaylistFileService
  ) {}

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
        offset: i * 100,
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
    const me = await this.spotifyService.getMe();
    const originalPlaylist = await this.getPlaylistWithAllTracks(playlistid);

    const newPlaylistName = `Remix - ${originalPlaylist.name}`;
    // Somehow the spotify API does not always add the description properly. So we keep track of the expected description.
    // If the actual description does not match the expected description, we will update the playlist with the expected description.
    const expectedDescription = `This playlist has been remixed using SpotifyManager. Please do not remove the original playlist id from the description. Original playlist: {${originalPlaylist.id}}`;
    const newPlaylist = await this.spotifyService.createPlaylist(
      newPlaylistName,
      {
        description: expectedDescription,
      });
    let actualDescription = newPlaylist.description;
    let retries = 0;
    while (actualDescription != expectedDescription) {
      Logger.warn(
        `Description was not set properly for playlist ${newPlaylist.id}. Retrying...`
      );
      // Sadly the spotify API does not return the updated playlist object.. so we need to fetch it again.
      await this.spotifyService.changePlaylistDetails(newPlaylist.id, {
        description: expectedDescription,
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
    // We need to save the state of the original playlist
    this.fileService.writePlaylist(originalPlaylist, me.id);
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
   * A user can copy a playlist more than once. Get all the versions of the original playlist
   * @param playlistid
   */
  async getVersionsOfOriginalPlaylist(
    playlistid: string
  ): Promise<RemixedPlaylistInformation[]> {
    const me = await this.spotifyService.getMe();
    return this.fileService.getOriginalVersionsForPlaylist(playlistid, me.id);
  }

  /**
   * Compare a playlist to a version of the original playlist (remixes)
   * @param playlistid
   * @param originalPlaylistid
   * @param versionTimestamp
   */
  async comparePlaylist(
    playlistid: string,
    originalPlaylistid: string,
    versionTimestamp?: number
  ): Promise<Diff[]> {
    const me = await this.spotifyService.getMe();
    const versionInformation =
      await this.fileService.getOriginalVersionsForPlaylist(
        originalPlaylistid,
        me.id
      );

    if (versionInformation.length == 0) {
      throw new HttpException(
        'Currently comparing playlists to other playlists, which have not been remixed, is not supported.',
        501
      );
    }

    if (versionInformation.length > 1 && !versionTimestamp) {
      throw new HttpException(
        'Please specify a version of the original playlist to compare to. This should be the timestamp of which this version was created',
        400
      );
    }

    const fileOfOriginalPlaylist =
      versionInformation.length == 1
        ? `${versionInformation[0].createdOn}-${versionInformation[0].id}`
        : `${versionTimestamp}-${originalPlaylistid}`;
    const originalPlaylist = this.fileService.readPlaylist(
      fileOfOriginalPlaylist,
      me.id
    );

    const fullPlaylist = await this.getAllSongsInPlaylist(playlistid);
    return this.calculateChanges(
      originalPlaylist.tracks.items,
      fullPlaylist.items
    );
  }

  /**
   * Calculate the difference between two playlists.
   * Returns a two dimensional array  with the tracks of the two playlists combined.
   * The first element in the nested array is a -1 (track removed), 1 (track added) or 0 (track unchanged).
   * Example: [[0, track], [-1, track], [1, track]]
   * @param primary
   * @param secondary
   */
  private calculateChanges(
    primary: PlaylistTrackObject[],
    secondary: PlaylistTrackObject[]
  ): Diff[] {
    // Calculate the changes between the two playlists.
    // Do this by: Check if track is in both playlists. If so, it's a 0.
    // If the track is only present in the primary playlist, it's a -1.
    // If the track is only present in the secondary playlist, it's a 1.
    const changes: Diff[] = [];
    for (const track of primary) {
      const index = secondary.findIndex((t) => t.track.id == track.track.id);
      if (index == -1) {
        changes.push([-1, track]);
      } else {
        changes.push([0, track]);
      }
    }

    for (const track of secondary) {
      const index = primary.findIndex((t) => t.track.id == track.track.id);
      if (index == -1) {
        changes.push([1, track]);
      }
    }

    return changes;
  }

  /**
   * Remove all the songs in the given playlist and put the given tracks in the playlist.
   * @param originalPlaylistId
   * @param remixedPlaylistId
   * @param tracks
   */
  async syncPlaylist(
    originalPlaylistId: string,
    remixedPlaylistId: string,
    tracks: (TrackObjectFull | EpisodeObjectFull)[]
  ) {
    // Get all tracks in the playlist.
    const tracksInPlaylist = await this.getAllSongsInPlaylist(
      remixedPlaylistId
    );

    // Remove all the tracks in the playlist.
    await this.spotifyService.removeTracksFromPlaylist(
      remixedPlaylistId,
      tracksInPlaylist.items.map((track) => track.track)
    );
    await this.spotifyService.addTracksToPlaylist(
      remixedPlaylistId,
      tracks.map((track) => track.uri)
    );

    // Get the original playlist and save its state to a json file again
    const currentOriginalPlaylist = await this.getPlaylistWithAllTracks(
      originalPlaylistId
    );
    this.fileService.writePlaylist(
      currentOriginalPlaylist,
      (await this.spotifyService.getMe()).id
    );
  }
}
