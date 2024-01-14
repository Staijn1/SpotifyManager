import { Injectable } from '@angular/core';
import { HTTPService } from '../http/http-service.service';
import { environment } from '../../../environments/environment';
import { SpotifyAuthenticationService } from '../spotify-authentication/spotify-authentication.service';
import { MessageService } from '../message/message.service';
import {
  Diff,
  EpisodeObjectFull, ListOfUsersPlaylistsResponse,
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
    const token = await this.spotifyAuth.refreshAndGetAccessToken();
    await this.request(
      `${environment.apiURL}/playlists/remix/${playlistId}/?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Get all playlists of the current user
   */
  async getAllUserPlaylists(): Promise<ListOfUsersPlaylistsResponse> {
    const token = await this.spotifyAuth.refreshAndGetAccessToken();
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
    const token = await this.spotifyAuth.refreshAndGetAccessToken();
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
    const token = await this.spotifyAuth.refreshAndGetAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/${playlistid}?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Get all remixes of a playlist because a user can remix a playlist more than once
   * He will need to select which original version of the playlist he wants to compare it to.
   * @deprecated
   */
  async getRemixedPlaylistInformation(
    playlistid: string
  ): Promise<RemixedPlaylistInformation[]> {
    const token = await this.spotifyAuth.refreshAndGetAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/remixes/${playlistid}/versions/?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Compare a remix to its original playlist. The versiontimestamp is optional, when a playlist is only remixed once this is not needed.
   * When a playlist is remixed multiple times, this timestamp equals the timestamp of a specific remix date. This version will be used to compare
   * @param leftPlaylistId
   * @param versionTimestamp
   */
  async comparePlaylists(
    leftPlaylistId: string,
    rightPlaylistId: string,
    versionTimestamp?: number
  ): Promise<Diff[]> {
    const token = await this.spotifyAuth.refreshAndGetAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/compare?accessToken=${token}`,
      {
        method: 'POST',
        body: JSON.stringify({
          leftPlaylistId: leftPlaylistId,
          rightPlaylistId: rightPlaylistId,
          versionTimestamp: versionTimestamp,
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Make a request to the API to sync the playlist
   * @param originalPlaylistId
   * @param remixedPlaylistId
   * @param mergedTracks
   */
  async syncPlaylist(
    originalPlaylistId: string,
    remixedPlaylistId: string,
    mergedTracks: (TrackObjectFull | EpisodeObjectFull)[]
  ): Promise<void> {
    const token = await this.spotifyAuth.refreshAndGetAccessToken();
    return this.request(
      `${environment.apiURL}/playlists/sync?accessToken=${token}`,
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
