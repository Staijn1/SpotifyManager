import {Injectable} from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-js';

@Injectable()
export class SpotifyService {
  private _spotifyWebApi: SpotifyWebApi.SpotifyWebApiJs;

  constructor() {
    // this._spotifyWebApi = new SpotifyWebApi();
  }

  setAccessToken(accessToken: string) {
    // this._spotifyWebApi.setAccessToken(accessToken);
  }
}
