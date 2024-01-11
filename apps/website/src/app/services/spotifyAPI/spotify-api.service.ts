import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { SpotifyAuthenticationService } from '../spotify-authentication/spotify-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAPIService {
  private _spotifyApi: SpotifyWebApi.SpotifyWebApiJs;

  /**
   * Construct this object by initializing the spotify API and getting the access token
   * @param spotifyAuth
   */
  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
    this._spotifyApi = new SpotifyWebApi();
  }

  /**
   * Get the account information of the current user.
   * todo: move to own api
   * @returns {Promise<SpotifyApi.CurrentUsersProfileResponse>}
   */
  async getCurrentAccount(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    await this.refreshAccessToken();
    return this._spotifyApi.getMe();
  }

  /**
   * Get all playlists of the current user.
   * todo: move to own api
   * @param {{limit: number}} param
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  async getUserPlaylist(param?: { limit: number }): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    await this.refreshAccessToken();
    return this._spotifyApi.getUserPlaylists(undefined, param);
  }

  /**
   * Get from a generic URL in the spotify API
   * @param {string} url
   * @returns {Promise<object>}
   */
  async getGeneric(url: string): Promise<object> {
    await this.refreshAccessToken();
    return this._spotifyApi.getGeneric(url);
  }

  /**
   * Get the tp artists for this user
   * @returns {Promise<SpotifyApi.UsersTopArtistsResponse>}
   */
  async getTopArtists(): Promise<SpotifyApi.UsersTopArtistsResponse> {
    await this.refreshAccessToken();
    return this._spotifyApi.getMyTopArtists();
  }

  /**
   * Get the most played tracks for this user
   * @returns {Promise<SpotifyApi.UsersTopTracksResponse>}
   */
  async getTopTracks(): Promise<SpotifyApi.UsersTopTracksResponse> {
    await this.refreshAccessToken();
    return this._spotifyApi.getMyTopTracks();
  }

  /**
   * Refresh the access token with the spotify API
   * @private
   */
  private async refreshAccessToken(): Promise<void> {
    const data = await this.spotifyAuth.refreshAccessToken();
    this._spotifyApi.setAccessToken(data.access_token);
  }
}
