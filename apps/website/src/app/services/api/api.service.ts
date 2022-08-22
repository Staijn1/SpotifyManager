import {Injectable} from '@angular/core';
import {HTTPService} from '../http/http-service.service';
import {environment} from '../../../environments/environment';
import {SpotifyAuthenticationService} from '../spotifyAuthentication/spotify-authentication.service';
import {Diff, ForkedPlaylistInformation} from '@spotify/data';

@Injectable({
  providedIn: 'root'
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
   * Fork the playlist with given ID
   * @param {string} playlistId
   */
  async forkPlaylist(playlistId: string): Promise<void> {
    const token = await this.spotifyAuth.refreshAccessToken();
    await this.request(`${environment.url}/playlists/fork/${playlistId}/?accessToken=${token}`, {method: 'GET'})
  }

  /**
   * Get all playlists of the current user
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  async getAllUserPlaylists(): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return await this.request(`${environment.url}/playlists/?accessToken=${token}`, {method: 'GET'})
  }

  /**
   * Get all tracks of a playlist
   * @param {string} playlistId
   * @returns {Promise<SpotifyApi.PlaylistTrackResponse>}
   */
  async getAllTracksInPlaylist(playlistId: string): Promise<SpotifyApi.PlaylistTrackResponse> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(`${environment.url}/playlists/${playlistId}/songs/?accessToken=${token}`, {method: 'GET'})
  }

  /**
   * Get a specific playlist
   * @param {string} playlistid
   * @returns {Promise<any>}
   */
  async getPlaylist(playlistid: string): Promise<SpotifyApi.SinglePlaylistResponse> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(`${environment.url}/playlists/${playlistid}?accessToken=${token}`, {method: 'GET'})
  }

  /**
   * Get all forks of a playlist because a user can fork a playlist more than once
   * He will need to select which original version of the playlist he wants to compare it to.
   * @returns {Promise<ForkedPlaylistInformation[]>}
   */
  async getForkedPlaylistInformation(playlistid: string): Promise<ForkedPlaylistInformation[]> {
    const token = await this.spotifyAuth.refreshAccessToken();
    return this.request(`${environment.url}/playlists/forks/${playlistid}/versions/?accessToken=${token}`, {method: 'GET'})
  }

  /**
   * Compare a fork to it's original playlist. The versiontimestamp is optional, when a playlist is only forked once this is not needed.
   * When a playlist is forked multiple times, this timestamp equals the timestamp of a specific fork date. This version will be used to compare
   * @param {string} leftPlaylistId
   * @param {number} versionTimestamp
   */
  async comparePlaylists(leftPlaylistId: string, rightPlaylistId: string, versionTimestamp?: number): Promise<Diff[]> {
    const token = await this.spotifyAuth.refreshAccessToken()
    return this.request(`${environment.url}/playlists/compare?accessToken=${token}`, {
      method: 'POST',
      body: JSON.stringify({
        leftPlaylistId: leftPlaylistId,
        rightPlaylistId: rightPlaylistId,
        versionTimestamp: versionTimestamp
      }),
      headers: {'Content-Type': 'application/json'}
    })
  }

  /**
   * Make a request to the API to sync the playlist
   * @param {string} playlistID
   * @param {(SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull)[]} mergedTracks
   * @returns {Promise<any>}
   */
  async syncPlaylist(playlistID: string, mergedTracks: (SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull)[]) {
    const token = await this.spotifyAuth.refreshAccessToken()
    return this.request(`${environment.url}/playlists/sync?accessToken=${token}`, {
      method: 'POST',
      body: JSON.stringify({
        playlistid: playlistID,
        tracks: mergedTracks
      }),
      headers: {'Content-Type': 'application/json'}
    })
  }
}
