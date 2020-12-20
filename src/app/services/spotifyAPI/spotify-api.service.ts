import {Injectable} from '@angular/core';
import * as querystring from 'querystring';
import SpotifyWebApi from 'spotify-web-api-js';
import {TokenStorageService} from '../tokenStorage/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAPIService {
  public authenticationURL: string;

  private readonly CLIENT_ID = '4d7a0730965f4a2d99625e07d0307efd';
  private readonly CLIENT_SECRET = '9cf04dc7d1c3403da8fcebedf6e9818b';
  private readonly SCOPES = 'user-top-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
  private readonly REDIRECT_URI = 'http://172.16.54.112:4200/authorize';
  private _accessToken: string;
  private _refreshToken: string;
  private _spotifyApi: SpotifyWebApi.SpotifyWebApiJs;

  constructor(private readonly cookieService: TokenStorageService) {
    this.authenticationURL = 'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: this.CLIENT_ID,
        scope: this.SCOPES.replace(' ', '%20'),
        redirect_uri: this.REDIRECT_URI,
      });

    this._spotifyApi = new SpotifyWebApi();
  }

  authorize(codeReceived: string): void {
    const details = {
      grant_type: 'authorization_code',
      code: codeReceived,
      redirect_uri: this.REDIRECT_URI,
    };

    this.getToken(details);
  }

  private getToken(body): void {
    let formBody: any = [];
    for (const property in body) {
      if (body.hasOwnProperty(property)) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(body[property]);
        formBody.push(encodedKey + '=' + encodedValue);
      }
    }
    formBody = formBody.join('&');

    const encoded = btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Authorization: `Basic ${encoded}`
      },
      body: formBody
    }).then(response => response.json())
      .then(data => {
        if (data.refresh_token) {
          this._refreshToken = data.refresh_token;
          console.log('Yes!');
        }
        this._accessToken = data.access_token;

        this.cookieService.writeSession(this._accessToken, this._refreshToken);
      }).catch(err => {
      console.error(err);
    });

  }

  private refreshAccessToken(): void {
    const body = {
      grant_type: 'refresh_token',
      refresh_token: this._refreshToken
    };
    this.getToken(body);
  }

  isLoggedIn(): boolean {
    const received = this.cookieService.getStorage();

    if (received) {
      this._accessToken = received.accessToken;
      this._refreshToken = received.refreshToken;
    } else {
      this._accessToken = undefined;
      this._refreshToken = undefined;
    }

    this._spotifyApi.setAccessToken(this._accessToken);
    return (!!this._accessToken);
  }

  getCurrentAccount(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    this.refreshAccessToken();
    return this._spotifyApi.getMe();
  }

  getAccount(id: string): Promise<SpotifyApi.UserProfileResponse> {
    this.refreshAccessToken();
    return this._spotifyApi.getUser(id);
  }

  getUserPlaylist(param?: { limit: number }): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    this.refreshAccessToken();
    return this._spotifyApi.getUserPlaylists(undefined, param);
  }
}
