import {Injectable} from '@nestjs/common';

import * as SpotifyWebApi from 'spotify-web-api-node';

@Injectable()
export class SpotifyService {
  private _spotifyApi: SpotifyWebApi.SpotifyWebApiJs;

  constructor() {
    this._spotifyApi = new SpotifyWebApi();
  }

  setAccessToken(accessToken: string) {
    this._spotifyApi.setAccessToken(accessToken);
  }
}
