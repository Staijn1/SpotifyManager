import {Injectable} from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import {SpotifyAuthenticationService} from '../spotifyAuthentication/spotify-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAPIService {
  private _spotifyApi: SpotifyWebApi.SpotifyWebApiJs;

  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
    this._spotifyApi = new SpotifyWebApi();

    this._spotifyApi.setAccessToken(this.spotifyAuth.getTokens().accessToken);
  }

  getCurrentAccount(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    this.spotifyAuth.refreshAccessToken();
    return this._spotifyApi.getMe();
  }

  getAccount(id: string): Promise<SpotifyApi.UserProfileResponse> {
    this.spotifyAuth.refreshAccessToken();
    return this._spotifyApi.getUser(id);
  }

  getUserPlaylist(param?: { limit: number }): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    this.spotifyAuth.refreshAccessToken();
    return this._spotifyApi.getUserPlaylists(undefined, param);
  }
}
