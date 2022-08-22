import {HttpException, Injectable} from '@nestjs/common';
import {SpotifyService} from '../../../../spotify/spotify.service';
import {PlaylistFileService} from '../playlist-file-service/playlist-file.service';
import {Diff, ForkedPlaylistInformation} from '@spotify/data';

@Injectable()
export class PlaylistService {
  /**
   * Inject dependencies
   * @param {SpotifyService} spotifyService
   * @param fileService
   */
  constructor(private readonly spotifyService: SpotifyService, private readonly fileService: PlaylistFileService) {
  }

  /**
   * The spotify API returns only the first 100 tracks in a playlist.
   * This method will loop through the playlist and get the tracks in chunks of 100, and then return all the tracks.
   * @param {string} playlistid
   * @returns {Promise<SpotifyApi.PlaylistTrackResponse>}
   */
  public async getAllSongsInPlaylist(playlistid: string): Promise<SpotifyApi.PlaylistTrackResponse> {
    const response = await this.spotifyService.getTracksInPlaylist(playlistid);
    const amountOfChunks = Math.ceil(response.total / 100);

    for (let i = 1; i < amountOfChunks; i++) {
      const options = {
        offset: i * 100,
      };
      const tracks = await this.spotifyService.getTracksInPlaylist(playlistid, options);
      response.items = response.items.concat(tracks.items);
    }
    return response
  }

  /**
   * Creates a new playlist and songs from the given playlist are copied to the new playlist.
   * The songs in the original playlist are saved in the database, so it can be used to sync the forked playlist with the original one later.
   * @param {string} playlistid
   * @returns {string}
   */
  public async forkPlaylist(playlistid: string): Promise<SpotifyApi.CreatePlaylistResponse> {
    const me = await this.spotifyService.getMe();
    const originalPlaylist = await this.spotifyService.getPlaylistInformation(playlistid);
    originalPlaylist.tracks.items = []

    const newPlaylistName = `Fork - ${originalPlaylist.name}`;
    const newPlaylist = await this.spotifyService.createPlaylist(newPlaylistName,
      {
        description: `This playlist has been forked using SpotifyManager. Please do not remove the original playlist id from the description. Original playlist: {${originalPlaylist.id}}`
      });

    // The spotify api returns the tracks in the originalPlaylist but it limits the number of tracks to 100.
    // So we need to get the tracks in chunks of 100.
    const amountOfChunks = Math.ceil(originalPlaylist.tracks.total / 100);

    for (let i = 0; i < amountOfChunks; i++) {
      const options = {
        offset: i * 100,
      };
      const tracks = await this.spotifyService.getTracksInPlaylist(playlistid, options);
      originalPlaylist.tracks.items = originalPlaylist.tracks.items.concat(tracks.items)
      await this.spotifyService.addTracksToPlaylist(newPlaylist.id, tracks.items.map(track => track.track.uri));
    }

    this.fileService.writePlaylist(originalPlaylist, me.id)
    // We need to save the state of the original playlist
    return newPlaylist
  }

  /**
   * Get all the playlists that belong to the user that belongs to the given access token.
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  async getAllUserPlaylists(): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    const playlists = await this.spotifyService.getUserPlaylists();

    while (playlists.next != null) {
      const morePlaylists = await this.spotifyService.getGeneric(playlists.next) as SpotifyApi.ListOfUsersPlaylistsResponse;
      playlists.next = morePlaylists.next
      playlists.items = playlists.items.concat(morePlaylists.items)
    }

    return playlists
  }

  /**
   * Get a single playlist by id.
   * @param {string} playlistid
   * @returns {Promise<SpotifyApi.SinglePlaylistResponse>}
   */
  async getPlaylist(playlistid: string): Promise<SpotifyApi.SinglePlaylistResponse> {
    return this.spotifyService.getPlaylistInformation(playlistid)
  }

  /**
   * A user can copy a playlist more than once. Get all the versions of the original playlist
   * @param {string} playlistid
   * @returns {Promise<ForkedPlaylistInformation>}
   */
  async getVersionsOfOriginalPlaylist(playlistid: string): Promise<ForkedPlaylistInformation[]> {
    const me = await this.spotifyService.getMe();
    return this.fileService.getOriginalVersionsForPlaylist(playlistid, me.id)
  }

  /**
   * Compare a playlist to a version of the original playlist (forks)
   * @param {string} playlistid
   * @param {string} originalPlaylistid
   * @param {number} versionTimestamp
   * @returns {Promise<Diff[]>}
   */
  async comparePlaylist(playlistid: string, originalPlaylistid: string, versionTimestamp?: number): Promise<Diff[]> {
    const me = await this.spotifyService.getMe()
    const versionInformation = await this.fileService.getOriginalVersionsForPlaylist(originalPlaylistid, me.id);

    if (versionInformation.length == 0) {
      throw new HttpException('Currently comparing playlists to other playlists, which have not been forked, is not supported.', 501)
    }

    if (versionInformation.length > 1 && !versionTimestamp) {
      throw new HttpException('Please specify a version of the original playlist to compare to. This should be the timestamp of which this version was created', 400)
    }

    const fileOfOriginalPlaylist = versionInformation.length == 1 ? `${versionInformation[0].createdOn}-${versionInformation[0].id}` : `${versionTimestamp}-${originalPlaylistid}`
    const originalPlaylist = this.fileService.readPlaylist(fileOfOriginalPlaylist, me.id)

    const fullPlaylist = await this.getAllSongsInPlaylist(playlistid);
    return this.calculateChanges(originalPlaylist.tracks.items, fullPlaylist.items)
  }

  /**
   * Calculate the difference between two playlists.
   * Returns a two dimensional array  with the tracks of the two playlists combined.
   * The first element in the nested array is a -1 (track removed), 1 (track added) or 0 (track unchanged).
   * Example: [[0, track], [-1, track], [1, track]]
   * @param {SpotifyApi.SinglePlaylistResponse} primary
   * @param {SpotifyApi.SinglePlaylistResponse} secondary
   */
  private calculateChanges(primary: SpotifyApi.PlaylistTrackObject[], secondary: SpotifyApi.PlaylistTrackObject[]): Diff[] {
    // Calculate the changes between the two playlists.
    // Do this by: Check if track is in both playlists. If so, it's a 0.
    // If the track is only present in the primary playlist, it's a -1.
    // If the track is only present in the secondary playlist, it's a 1.
    const changes: Diff[] = [];
    for (const track of primary) {
      const index = secondary.findIndex(t => t.track.id == track.track.id);
      if (index == -1) {
        changes.push([-1, track]);
      } else {
        changes.push([0, track]);
      }
    }

    for (const track of secondary) {
      const index = primary.findIndex(t => t.track.id == track.track.id);
      if (index == -1) {
        changes.push([1, track]);
      }
    }

    return changes;
  }

  /**
   * Remove all the songs in the given playlist and put the given tracks in the playlist.
   * @param {string} playlistId
   * @param {(SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull)[]} tracks
   */
  async syncPlaylist(playlistId: string, tracks: (SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull)[]) {
    // Get all tracks in the playlist.
    const tracksInPlaylist = await this.getAllSongsInPlaylist(playlistId);

    // Remove all the tracks in the playlist.
    await this.spotifyService.removeTracksFromPlaylist(playlistId, tracksInPlaylist.items.map(track => track.track));
    await this.spotifyService.addTracksToPlaylist(playlistId, tracks.map(track => track.uri));
  }
}
