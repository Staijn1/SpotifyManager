import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { SpotifyAuthenticationService } from '../spotify-authentication/spotify-authentication.service';
import { UpdateUserLoginStatus } from '../../redux/user-state/user-state.action';
import { Store } from '@ngrx/store';
import { TimeRange } from '@spotify-manager/core';

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
   */
  async getCurrentAccount(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    this.updateAccessToken();
    return this._spotifyApi.getMe();
  }

  /**
   * Get all playlists of the current user.
   * todo: move to own api
   * @param {{limit: number}} param
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  async getUserPlaylist(param?: { limit: number }): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    this.updateAccessToken();
    return this._spotifyApi.getUserPlaylists(undefined, param);
  }

  /**
   * Get from a generic URL in the spotify API
   * @param {string} url
   * @returns {Promise<object>}
   */
  async getGeneric(url: string): Promise<object> {
    this.updateAccessToken();
    return this._spotifyApi.getGeneric(url);
  }

  /**
   * Get the tp artists for this user
   * @returns {Promise<SpotifyApi.UsersTopArtistsResponse>}
   */
  async getTopArtists(timerange: TimeRange): Promise<SpotifyApi.UsersTopArtistsResponse> {
    this.updateAccessToken();
    return this._spotifyApi.getMyTopArtists({
      time_range: timerange,
    });
  }

  /**
   * Get the most played tracks for this user
   * @returns {Promise<SpotifyApi.UsersTopTracksResponse>}
   */
  async getTopTracks(timerange: TimeRange): Promise<SpotifyApi.UsersTopTracksResponse> {
    this.updateAccessToken();
    return this._spotifyApi.getMyTopTracks({limit: 10, time_range: timerange});
  }

  /**
   * Refresh the access token with the spotify API
   * @private
   */
  private updateAccessToken(): void {
    const data = this.spotifyAuth.getAccessToken();
    this._spotifyApi.setAccessToken(data);
  }
}
