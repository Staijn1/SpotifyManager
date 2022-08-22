import {HttpException, Injectable} from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import {HttpService} from '@nestjs/axios';
import {firstValueFrom} from 'rxjs';

@Injectable()
export class SpotifyService {
  private _spotifyApi: SpotifyWebApi;
  readonly MAX_RETRIES = 15;
  currentRetryAttempt = 0;

  /**
   * Create an instance of the SpotifyWebApi class.
   */
  constructor(private httpService: HttpService) {
    this._spotifyApi = new SpotifyWebApi();
  }

  /**
   * Called by the authentication middleware to set the access token. This access token is used to make calls to the Spotify API.
   * The access token belongs to the user that is currently logged in and made a call
   * @param {string} accessToken
   */
  setAccessToken(accessToken: string) {
    try {
      this._spotifyApi.setAccessToken(accessToken);
    } catch (e) {
      throw new HttpException('Invalid access token', 401);
    }
  }

  /**
   * Get playlist information from Spotify with the given playlist id.
   * @param {string} playlistid
   * @returns {any}
   */
  async getPlaylistInformation(playlistid: string): Promise<SpotifyApi.SinglePlaylistResponse> {
    const response = await this._spotifyApi.getPlaylist(playlistid);
    return response.body
  }

  /**
   * Create a new playlist with the given name.
   * @param {string} name
   * @param {PlaylistDetailsOptions}  options
   * @returns {any}
   */
  async createPlaylist(name: string, options?: any): Promise<SpotifyApi.CreatePlaylistResponse> {
    const response = await this._spotifyApi.createPlaylist(name, options);
    return response.body
  }

  /**
   * Get the tracks in the given playlist. Pagination can be done in the options object with the offset property.
   * @param {string} playlistid
   * @param {GetPlaylistTrackOptions} options
   * @returns {Promise<any>}
   */
  async getTracksInPlaylist(playlistid: string, options?: any): Promise<SpotifyApi.PlaylistTrackResponse> {
    const response = await this._spotifyApi.getPlaylistTracks(playlistid, options);
    return response.body
  }

  /**
   * Given a list of tracks, add them to the given playlist.
   * Options are of type PositionsOptions supplied by the spotify-web-api-node library.
   * @param id
   * @param {string[]} trackURIs
   * @param {PositionOptions} options
   * @returns {Promise<SpotifyApi.AddTracksToPlaylistResponse>}
   */
  async addTracksToPlaylist(id, trackURIs: string[], options?: any): Promise<SpotifyApi.AddTracksToPlaylistResponse> {
    try {
      const response = await this._spotifyApi.addTracksToPlaylist(id, trackURIs, options);
      this.currentRetryAttempt = 0;
      return response.body
    } catch (e) {
      console.log(`Caught error for a batch, retrying... Retry attempt ${++this.currentRetryAttempt}`)
      if (this.currentRetryAttempt < this.MAX_RETRIES)
        return this.addTracksToPlaylist(id, trackURIs, options);
      else {
        throw new HttpException('Failed to add tracks to playlist', 500);
      }
    }
  }

  /**
   * Get the first page of user playlists
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  async getUserPlaylists() {
    const response = await this._spotifyApi.getUserPlaylists();
    return response.body
  }

  /**
   * Fetch from the spotify API using a given url
   * @param {string} url
   * @returns {Promise<void>}
   */
  async getGeneric(url: string): Promise<any> {
    const response = await firstValueFrom(this.httpService.get(url, {headers: {'Authorization': `Bearer ${this._spotifyApi.getAccessToken()}`}}))

    if (response.status !== 200) {
      throw new HttpException(response.statusText, response.status)
    }
    return response.data;
  }

  /**
   * Get the access token
   * @returns {string}
   */
  getAccessToken(): string {
    return this._spotifyApi.getAccessToken()
  }

  /**
   * Get the current signed in user
   * @returns {Promise<SpotifyApi.CurrentUsersProfileResponse>}
   */
  async getMe(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    const response = await this._spotifyApi.getMe();
    return response.body
  }

  /**
   * Remove the given tracks from the given playlist
   * @param {string} playlistId
   * @param {{uri: string}[]} trackURIs
   * @returns {Promise<Response<SpotifyApi.RemoveTracksFromPlaylistResponse>>}
   */
  async removeTracksFromPlaylist(playlistId: string, trackURIs: { uri: string }[]) {
    // The spotify api only allows 100 tracks to be removed at a time
    // So we need to split the tracks into chunks of 100 and remove them one by one
    const chunks = this.splitArrayInChunks(trackURIs, 100);
    for (const chunk of chunks) {
      await this._spotifyApi.removeTracksFromPlaylist(playlistId, chunk.map(track => {
        return {uri: track.uri}
      }));
    }
  }

  /**
   * Split an array into chunks of a given size
   * @param {any[]} array
   * @param {number} chunkSize
   * @returns {any[]}
   * @private
   */
  private splitArrayInChunks(array: any[], chunkSize: number): any[][] {
    const chunks = [];
    let i = 0;
    while (i < array.length) {
      chunks.push(array.slice(i, i += chunkSize));
    }
    return chunks;
  }
}
