import {Injectable} from '@angular/core';
import * as querystring from 'querystring';
import {SessionType} from '../../types/SessionType';
import {TokenStorageService} from '../tokenStorage/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthenticationService {
  public authenticationURL: string;

  private readonly CLIENT_ID = '4d7a0730965f4a2d99625e07d0307efd';
  private readonly CLIENT_SECRET = '9cf04dc7d1c3403da8fcebedf6e9818b';
  private readonly SCOPES = 'user-top-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
  private readonly REDIRECT_URI = 'http://172.16.54.112:4200/authorize';
  private _accessToken: string;
  private _refreshToken: string;

  constructor(private readonly tokenStorageService: TokenStorageService) {
    this.authenticationURL = 'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: this.CLIENT_ID,
        scope: this.SCOPES.replace(' ', '%20'),
        redirect_uri: this.REDIRECT_URI,
      });

    this._accessToken = this.getTokens().accessToken;
    this._refreshToken = this.getTokens().refreshToken;
  }

  authorize(codeReceived: string): void {
    const details = {
      grant_type: 'authorization_code',
      code: codeReceived,
      redirect_uri: this.REDIRECT_URI,
    };

    this.requestToken(details);
  }

  private requestToken(body): void {
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

        this.tokenStorageService.writeSession(this._accessToken, this._refreshToken);
      }).catch(err => {
      console.error(err);
    });

  }

  refreshAccessToken(): void {
    const body = {
      grant_type: 'refresh_token',
      refresh_token: this._refreshToken
    };
    this.requestToken(body);
  }

  setTokens(): void {
    const received = this.tokenStorageService.getStorage();

    if (received) {
      this._accessToken = received.accessToken;
      this._refreshToken = received.refreshToken;
    } else {
      this._accessToken = undefined;
      this._refreshToken = undefined;
    }
  }

  getTokens(): SessionType {
    return this.tokenStorageService.getStorage();
  }

  isLoggedIn(): boolean {
    return (!!this._accessToken);
  }
}
