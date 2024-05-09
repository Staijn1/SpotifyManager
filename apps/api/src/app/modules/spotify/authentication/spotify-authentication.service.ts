import { HttpException, Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpotifyAuthenticationService {
  public spotifyWebApi: SpotifyWebApi;

  constructor(readonly configService: ConfigService) {
    const clientId = configService.get('SPOTIFY_CLIENT_ID');
    if (!clientId) {
      throw new Error('Spotify client id not provided');
    }

    const clientSecret = configService.get('SPOTIFY_CLIENT_SECRET');
    if (!clientSecret) {
      throw new Error('Spotify client secret not provided');
    }

    this.spotifyWebApi = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
    });
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

  /**
   * Authenticate this API with an API access token to make calls to the Spotify API
   * We use the client credentials flow to authenticate the API
   */
  async authenticateWithClientCredentials() {
    try {
      const data = await this.spotifyWebApi.clientCredentialsGrant();
      this.spotifyWebApi.setAccessToken(data.body['access_token']);
    } catch (e) {
      throw new HttpException('Could not authenticate with Spotify API', 401);
    }
  }
}
