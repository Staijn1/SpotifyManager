import { Injectable } from '@angular/core';
import { HTTPService } from '../http/http-service.service';
import { environment } from '../../../environments/environment';
import { SpotifyAuthenticationService } from '../spotify-authentication/spotify-authentication.service';
import { MessageService } from '../message/message.service';
import {
  Diff,
  EpisodeObjectFull,
  ICompareRemixedPlaylistRequest,
  ListOfUsersPlaylistsResponse,
  PlaylistTrackResponse,
  SinglePlaylistResponse,
  TrackObjectFull
} from '@spotify-manager/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends HTTPService {
  /**
   * Inject the right dependencies
   * @param spotifyAuth
   * @param messageService
   */
  constructor(private readonly spotifyAuth: SpotifyAuthenticationService, messageService: MessageService) {
    super(messageService);
  }

  /**
   * Remix the playlist with given ID
   * @param playlistId
   * @param ignoreNotificationsForPlaylist
   */
  async remixPlaylist(playlistId: string, ignoreNotificationsForPlaylist: boolean): Promise<void> {
    const token = this.spotifyAuth.getAccessToken();
    await this.request(
      `${environment.apiURL}/playlists/remix/?accessToken=${token}`,
      {
        method: 'POST',
        body: JSON.stringify({
          playlistId: playlistId,
          ignoreNotificationsForPlaylist: ignoreNotificationsForPlaylist
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  /**
   * Get all playlists of the current user
   */
  async getAllUserPlaylists(): Promise<ListOfUsersPlaylistsResponse> {
    const token = this.spotifyAuth.getAccessToken();
    return await this.request(
      `${environment.apiURL}/playlists/?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Get all tracks of a playlist
   * @param playlistId
   */
  async getAllTracksInPlaylist(
    playlistId: string
  ): Promise<PlaylistTrackResponse> {
    const token = this.spotifyAuth.getAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/${playlistId}/songs/?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Get a specific playlist
   * @param {string} playlistid
   * @returns {Promise<any>}
   */
  async getPlaylist(
    playlistid: string
  ): Promise<SinglePlaylistResponse> {
    const token = this.spotifyAuth.getAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/${playlistid}?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Compare a playlist to another.
   * One playlist is set as the base playlist, of which the other playlist will be compared against.
   * @param remixedPlaylistId
   */
  async comparePlaylists(remixedPlaylistId: string): Promise<Diff[]> {
    const token = this.spotifyAuth.getAccessToken();
    const body: ICompareRemixedPlaylistRequest = {
      remixedPlaylistId: remixedPlaylistId
    };
    return this.request(
      `${environment.apiURL}/playlists/remix/compare?accessToken=${token}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  /**
   * Make a request to the API to sync the playlist
   * @param remixedPlaylistId
   * @param mergedTracks
   */
  async syncPlaylist(
    remixedPlaylistId: string,
    mergedTracks: (TrackObjectFull | EpisodeObjectFull)[]
  ): Promise<void> {
    const token = this.spotifyAuth.getAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/remix/sync?accessToken=${token}`,
      {
        method: 'POST',
        body: JSON.stringify({
          remixedPlaylistId: remixedPlaylistId,
          tracks: mergedTracks
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  async getMyRemixedPlaylists(): Promise<ListOfUsersPlaylistsResponse> {
    const token = this.spotifyAuth.getAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/remix/?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  async getOriginalPlaylistForRemix(remixedPlaylistId: string): Promise<SinglePlaylistResponse> {
    const token = this.spotifyAuth.getAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/remix/original/${remixedPlaylistId}?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  djModePlaylist(playlistId: string, fadingTime: number) {
    const token = this.spotifyAuth.getAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/dj-mode/${playlistId}?fadingTime=${fadingTime}&accessToken=${token}`,
      {
        method: 'GET',
      }
    );
  }
}
