import { Injectable } from '@angular/core';
import { HTTPService } from '../http/http-service.service';
import { environment } from '../../../environments/environment';
import { SpotifyAuthenticationService } from '../spotify-authentication/spotify-authentication.service';
import { MessageService } from '../message/message.service';
import {
  Diff,
  EpisodeObjectFull, ICompareRemixedPlaylistRequest, ListOfUsersPlaylistsResponse,
  PlaylistTrackResponse,
  RemixedPlaylistInformation,
  SinglePlaylistResponse,
  TrackObjectFull
} from '@spotify-manager/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService extends HTTPService {
  /**
   * Inject the right dependencies
   * @param spotifyAuth
   * @param messageService
   */
  constructor(private readonly spotifyAuth: SpotifyAuthenticationService, protected override readonly messageService: MessageService) {
    super(messageService);
  }

  /**
   * Remix the playlist with given ID
   * @param playlistId
   */
  async remixPlaylist(playlistId: string): Promise<void> {
    const token = this.spotifyAuth.getAccessToken();
    await this.request(
      `${environment.apiURL}/playlists/remix/${playlistId}/?accessToken=${token}`,
      { method: 'GET' }
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
   * @param originalPlaylistId
   * @param remixedPlaylistId
   */
  async comparePlaylists(originalPlaylistId: string, remixedPlaylistId: string,): Promise<Diff[]> {
    const token = this.spotifyAuth.getAccessToken();
    const body: ICompareRemixedPlaylistRequest = {
      originalPlaylistId: originalPlaylistId,
      remixedPlaylistId: remixedPlaylistId,
    }
    return this.request(
      `${environment.apiURL}/playlists/remix/compare?accessToken=${token}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Make a request to the API to sync the playlist
   * @param remixedPlaylistId
   * @param mergedTracks
   */
  async syncPlaylist(
    originalPlaylistId: string,
    remixedPlaylistId: string,
    mergedTracks: (TrackObjectFull | EpisodeObjectFull)[]
  ): Promise<void> {
    const token = this.spotifyAuth.getAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/remix/sync?accessToken=${token}`,
      {
        method: 'POST',
        body: JSON.stringify({
          originalPlaylistId: originalPlaylistId,
          remixedPlaylistId: remixedPlaylistId,
          tracks: mergedTracks,
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
