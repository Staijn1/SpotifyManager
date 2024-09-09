import {HttpException, Injectable} from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import {HttpService} from '@nestjs/axios';
import {firstValueFrom} from 'rxjs';
import {
  AddTracksToPlaylistResponse,
  AudioFeaturesObject,
  CreatePlaylistResponse,
  CurrentUsersProfileResponse,
  ListOfUsersPlaylistsResponse,
  PlaylistTrackResponse,
  SinglePlaylistResponse
} from '@spotify-manager/core';
import {SpotifyAuthenticationService} from '../authentication/spotify-authentication.service';

@Injectable()
export class SpotifyService {
  readonly MAX_RETRIES = 15;
  currentRetryAttempt = 0;

  private get spotifyApi(): SpotifyWebApi {
    return this.spotifyAuthService.spotifyWebApi;
  }

  /**
   * Create an instance of the SpotifyWebApi class.
   */
  constructor(private httpService: HttpService, private readonly spotifyAuthService: SpotifyAuthenticationService) {
  }

  /**
   * Get playlist information from Spotify with the given playlist id.
   * @param  playlistid
   */
  async getPlaylistInformation(playlistid: string): Promise<SinglePlaylistResponse> {
    const response = await this.spotifyApi.getPlaylist(playlistid);
    return response.body
  }

  /**
   * Create a new playlist with the given name.
   * @param name
   * @param  options
   * todo: remove any types
   */
  async createPlaylist(name: string, options?: Record<string, any>): Promise<CreatePlaylistResponse> {
    const response = await this.spotifyApi.createPlaylist(name, options);
    return response.body
  }

  /**
   * Get the tracks in the given playlist. Pagination can be done in the options object with the offset property.
   * @param playlistid
   * @param options
   * todo: remove any types
   */
  async getTracksInPlaylist(playlistid: string, options?: Record<string, any>): Promise<PlaylistTrackResponse> {
    const response = await this.spotifyApi.getPlaylistTracks(playlistid, options);
    return response.body
  }

  /**
   * Given a list of tracks, add them to the given playlist.
   * Options are of type PositionsOptions supplied by the spotify-web-api-node library.
   * @param id
   * @param trackURIs
   * @param options
   */
  async addTracksToPlaylist(id, trackURIs: string[], options?: any): Promise<AddTracksToPlaylistResponse> {
    try {
      // The spotify api only allows 100 tracks to be added at a time
      // So we need to split the tracks into chunks of 100 and add them one by one
      const chunks = this.splitArrayInChunks(trackURIs, 100);
      let response;
      for (const chunk of chunks) {
        response = await this.spotifyApi.addTracksToPlaylist(id, chunk, options);
      }

      this.currentRetryAttempt = 0;
      return response.body
    } catch (e) {
      this.currentRetryAttempt++;
      console.log(`Caught error for a batch, retrying... Retry attempt ${this.currentRetryAttempt}`)
      if (this.currentRetryAttempt < this.MAX_RETRIES)

        return this.addTracksToPlaylist(id, trackURIs, options);
      else {
        console.error(e)
        throw new HttpException('Failed to add tracks to playlist', 500);
      }
    }
  }

  /**
   * Get the first page of user playlists.
   * @param userid - The user id of the user to get the playlists from. If not provided, the current user's playlists are fetched.
   */
  async getUserPlaylists(userid?: string): Promise<ListOfUsersPlaylistsResponse> {
    const response = userid ? await this.spotifyApi.getUserPlaylists(userid) : await this.spotifyApi.getUserPlaylists();
    return response.body
  }

  /**
   * Fetch from the spotify API using a given url
   * @param url
   */
  async getGeneric(url: string): Promise<any> {
    const response = await firstValueFrom(this.httpService.get(url, {headers: {'Authorization': `Bearer ${this.spotifyApi.getAccessToken()}`}}))

    if (response.status !== 200) {
      throw new HttpException(response.statusText, response.status)
    }
    return response.data;
  }

  /**
   * Get the current signed in user
   */
  async getMe(): Promise<CurrentUsersProfileResponse> {
    const response = await this.spotifyApi.getMe();
    return response.body
  }

  /**
   * Remove the given tracks from the given playlist
   * @param playlistId
   * @param trackURIs
   */
  async removeTracksFromPlaylist(playlistId: string, trackURIs: { uri: string }[]) {
    // The spotify api only allows 100 tracks to be removed at a time
    // So we need to split the tracks into chunks of 100 and remove them one by one
    const chunks = this.splitArrayInChunks(trackURIs, 100);
    for (const chunk of chunks) {
      await this.spotifyApi.removeTracksFromPlaylist(playlistId, chunk.map(track => {
        return {uri: track.uri}
      }));
    }
  }

  /**
   * Split an array into chunks of a given size
   * @param array
   * @param chunkSize
   * @private
   * todo: remove any types
   */
  private splitArrayInChunks(array: any[], chunkSize: number): any[][] {
    const chunks = [];
    let i = 0;
    while (i < array.length) {
      chunks.push(array.slice(i, i += chunkSize));
    }
    return chunks;
  }

  /**
   * Change the details of a playlist, such as the description
   * @param id
   * @param options
   */
  async changePlaylistDetails(id: string, options: { description: string }) {
    const newPlaylist = await this.spotifyApi.changePlaylistDetails(id, options)
    return newPlaylist.body;
  }

  /**
   * Remove the playlist with the given id (unfollow)
   * @param id
   */
  async removePlaylist(id: string) {
    await this.spotifyApi.unfollowPlaylist(id);
  }

  async getUser(userId: string) {
    const response = await this.spotifyApi.getUser(userId);
    return response.body
  }

  getCurrentUser() {
    return this.spotifyAuthService.currentUser;
  }

  /**
   * Get audio features for the given track IDs.
   * @param trackIds
   */
  async getAudioAnalysisForTracks(trackIds: string[]): Promise<AudioFeaturesObject[]> {
    const chunks = this.splitArrayInChunks(trackIds, 100) as string[][];
    const promises = chunks.map(chunk => this.spotifyApi.getAudioFeaturesForTracks(chunk));

    const responses = await Promise.all(promises);

    return responses.flatMap(response => response.body.audio_features);
  }
}
