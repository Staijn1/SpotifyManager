import {HttpException, Injectable} from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';

@Injectable()
export class SpotifyService {
  private _spotifyApi: SpotifyWebApi;
  readonly MAX_RETRIES = 15;
  currentRetryAttempt = 0;

  /**
   * Create an instance of the SpotifyWebApi class.
   */
  constructor() {
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
}
