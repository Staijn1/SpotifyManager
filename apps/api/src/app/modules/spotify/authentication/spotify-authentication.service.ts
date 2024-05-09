import { HttpException, Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';

@Injectable()
export class SpotifyAuthenticationService {
  public spotifyWebApi: SpotifyWebApi;

  constructor() {
    this.spotifyWebApi = new SpotifyWebApi();
  }

  /**
   * Called by the authentication middleware to set the access token. This access token is used to make calls to the Spotify API.
   * The access token belongs to the user that is currently logged in and made a call
   * @param  accessToken
   */
  setAccessToken(accessToken: string) {
    try {
      this.spotifyWebApi.setAccessToken(accessToken);
    } catch (e) {
      throw new HttpException('Invalid access token', 401);
    }
  }
}
