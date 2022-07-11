import {Injectable} from '@angular/core';
import {HTTPService} from '../http/http-service.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends HTTPService {

 /* constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
  }*/

  /**
   * Fork the playlist with given ID
   * @param {string} playlistId
   */
  async forkPlaylist(playlistId: string): Promise<void> {

    // this.request(`${environment.url}/${playlistId}?accessToken=`, {method: 'POST'})
  }
}
