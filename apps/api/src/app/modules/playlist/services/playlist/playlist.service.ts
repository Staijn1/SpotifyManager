import {HttpException, Injectable} from '@nestjs/common';
import {SpotifyService} from '../../../../spotify/spotify.service';
import {PlaylistFileService} from '../playlist-file-service/playlist-file.service';
import {Diff, ForkedPlaylistInformation} from '@spotify/data';

@Injectable()
export class PlaylistService {
  /**
   * Inject dependencies
   * @param {SpotifyService} spotifyService
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
    // We need to save the state of the original pla
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
    console.log(originalPlaylist)
    return []
  }
}
