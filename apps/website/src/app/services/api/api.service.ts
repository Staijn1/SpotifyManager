import {Injectable} from '@angular/core';
import {HTTPService} from '../http/http-service.service';
import {environment} from '../../../environments/environment';
import {SpotifyAuthenticationService} from '../spotifyAuthentication/spotify-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends HTTPService {

  /**
   * Inject the right dependencies
   * @param {SpotifyAuthenticationService} spotifyAuth
   */
  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
    super();
  }

  /**
   * Fork the playlist with given ID
   * @param {string} playlistId
   */
  async forkPlaylist(playlistId: string): Promise<void> {
    const token = await this.spotifyAuth.refreshAccessToken();
    await this.request(`${environment.url}/playlists/fork/${playlistId}/?accessToken=${token}`, {method: 'GET'})
  }

  /**
   * Get all playlists of the current user
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  async getAllUserPlaylists(): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return await this.request(`${environment.url}/playlists/?accessToken=${token}`, {method: 'GET'})
  }

  /**
   * Get all tracks of a playlist
   * @param {string} playlistId
   * @returns {Promise<SpotifyApi.PlaylistTrackResponse>}
   */
  async getAllTracksInPlaylist(playlistId: string): Promise<SpotifyApi.PlaylistTrackResponse> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(`${environment.url}/playlists/${playlistId}/songs/?accessToken=${token}`, {method: 'GET'})
  }
}
