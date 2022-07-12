import {Injectable} from '@angular/core';
import {HTTPService} from '../http/http-service.service';
import {environment} from '../../../environments/environment';
import {SpotifyAuthenticationService} from '../spotifyAuthentication/spotify-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends HTTPService {

  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
    super();
  }

  /**
   * Fork the playlist with given ID
   * @param {string} playlistId
   */
  async forkPlaylist(playlistId: string): Promise<void> {
    console.log('Test')
    const token = await this.spotifyAuth.refreshAccessToken();
    await this.request(`${environment.url}/playlists/fork/${playlistId}/?accessToken=${token}`, {method: 'GET'})
  }
}
