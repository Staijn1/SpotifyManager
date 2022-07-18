import {Injectable} from '@nestjs/common';
import {SpotifyService} from '../../../../spotify/spotify.service';

@Injectable()
export class PlaylistService {
  /**
   * Inject dependencies
   * @param {SpotifyService} spotifyService
   */
  constructor(private readonly spotifyService: SpotifyService) {
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
    const playlist = await this.spotifyService.getPlaylistInformation(playlistid);

    const newPlaylistName = `Fork - ${playlist.name}`;
    const newPlaylist = await this.spotifyService.createPlaylist(newPlaylistName,
      {
        description: `This playlist has been forked using SpotifyManager. Please do not remove the original playlist id from the description. Original playlist: {${playlist.id}}`
      });

    // The spotify api returns the tracks in the playlist but it limits the number of tracks to 100.
    // So we need to get the tracks in chunks of 100.
    const amountOfChunks = Math.ceil(playlist.tracks.total / 100);

    for (let i = 0; i < amountOfChunks; i++) {
      const options = {
        offset: i * 100,
      };
      const tracks = await this.spotifyService.getTracksInPlaylist(playlistid, options);

      await this.spotifyService.addTracksToPlaylist(newPlaylist.id, tracks.items.map(track => track.track.uri));
    }
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
}
