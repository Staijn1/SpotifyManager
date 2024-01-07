import { Injectable } from '@angular/core';
import { HTTPService } from '../http/http-service.service';
import { environment } from '../../../environments/environment';
import { SpotifyAuthenticationService } from '../spotifyAuthentication/spotify-authentication.service';
import { Diff, RemixedPlaylistInformation } from 'core';

@Injectable({
  providedIn: 'root',
})
export class ApiService extends HTTPService {
  /**
   * Inject the right dependencies
   * @param {SpotifyAuthenticationService} spotifyAuth
   */
  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
    super();
  }

  /**
   * Remix the playlist with given ID
   * @param {string} playlistId
   */
  async remixPlaylist(playlistId: string): Promise<void> {
    const token = await this.spotifyAuth.refreshAccessToken();
    await this.request(
      `${environment.url}/playlists/remix/${playlistId}/?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Get all playlists of the current user
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  async getAllUserPlaylists(): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return await this.request(
      `${environment.url}/playlists/?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Get all tracks of a playlist
   * @param {string} playlistId
   * @returns {Promise<SpotifyApi.PlaylistTrackResponse>}
   */
  async getAllTracksInPlaylist(
    playlistId: string
  ): Promise<SpotifyApi.PlaylistTrackResponse> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(
      `${environment.url}/playlists/${playlistId}/songs/?accessToken=${token}`,
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
  ): Promise<SpotifyApi.SinglePlaylistResponse> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(
      `${environment.url}/playlists/${playlistid}?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Get all remixes of a playlist because a user can remix a playlist more than once
   * He will need to select which original version of the playlist he wants to compare it to.
   * @returns {Promise<RemixedPlaylistInformation[]>}
   */
  async getRemixedPlaylistInformation(
    playlistid: string
  ): Promise<RemixedPlaylistInformation[]> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(
      `${environment.url}/playlists/remixes/${playlistid}/versions/?accessToken=${token}`,
      { method: 'GET' }
    );
  }

  /**
   * Compare a remix to its original playlist. The versiontimestamp is optional, when a playlist is only remixed once this is not needed.
   * When a playlist is remixed multiple times, this timestamp equals the timestamp of a specific remix date. This version will be used to compare
   * @param {string} leftPlaylistId
   * @param {number} versionTimestamp
   */
  async comparePlaylists(
    leftPlaylistId: string,
    rightPlaylistId: string,
    versionTimestamp?: number
  ): Promise<Diff[]> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(
      `${environment.url}/playlists/compare?accessToken=${token}`,
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
   * @param {string} remixedPlaylistId
   * @param {(SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull)[]} mergedTracks
   * @returns {Promise<any>}
   */
  async syncPlaylist(
    originalPlaylistId: string,
    remixedPlaylistId: string,
    mergedTracks: (SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull)[]
  ): Promise<any> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(
      `${environment.url}/playlists/sync?accessToken=${token}`,
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
