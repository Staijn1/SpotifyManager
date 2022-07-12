import {Injectable} from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import {SpotifyAuthenticationService} from '../spotifyAuthentication/spotify-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAPIService {
  private _spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
  private tracks: string[][] = [];
  private index = 0;

  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
    this._spotifyApi = new SpotifyWebApi();

    this.getAccessToken();
  }

  /**
   * Get the account information of the current user.
   * todo: move to own api
   * @returns {Promise<SpotifyApi.CurrentUsersProfileResponse>}
   */
  getCurrentAccount(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    this.getAccessToken();
    return this._spotifyApi.getMe();
  }

  /**
   * Get all playlists of the current user.
   * todo: move to own api
   * @param {{limit: number}} param
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  getUserPlaylist(param?: { limit: number }): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    this.getAccessToken();
    return this._spotifyApi.getUserPlaylists(undefined, param);
  }

  /**
   * Todo: remove or move to own api??
   * @param {string} playlistName
   * @param {string[]} playlistsToMerge
   * @returns {Promise<void>}
   */
  async mergePlaylists(playlistName: string, playlistsToMerge: string[]): Promise<void> {
    this.tracks = [];
    this.index = 0;
    this.getAccessToken();
    const currentUserId = sessionStorage.getItem('userId') as string;

    const createPlaylistBody = {
      name: playlistName,
      public: true,
      collaborative: false,
      description: 'This merge was merged with Spotify Manager! Check it out here: www.steinjonker.nl'
    };

    const createdPlaylistResponse = await this._spotifyApi.createPlaylist(currentUserId, createPlaylistBody);
    const createdPlaylistId = createdPlaylistResponse.id;

    for (const playlistid of playlistsToMerge) {
      const tracksInPlaylistResponse = await this._spotifyApi.getPlaylistTracks(playlistid);
      this.tracks[this.index] = [];
      for (const track of tracksInPlaylistResponse.items) {
        if (!track.is_local) {
          this.tracks[this.index].push(track.track.uri);
        }
      }
      this.index++;
      await this.continueRetrievingTracksOfPlaylist(tracksInPlaylistResponse.next);
    }

    for (const groupedTracks of this.tracks) {
      await this._spotifyApi.addTracksToPlaylist(createdPlaylistId, groupedTracks);
    }

  }

  private async continueRetrievingTracksOfPlaylist(url: string, params?: any): Promise<void> {
    if (!url) {
      return;
    }

    const response = await this._spotifyApi.getGeneric(url) as SpotifyApi.PlaylistTrackResponse;
    this.tracks[this.index] = [];
    for (const extraTracks of response.items) {
      if (!extraTracks.is_local) {
        this.tracks[this.index].push(extraTracks.track.uri);
      }
    }
    this.index++;
    await this.continueRetrievingTracksOfPlaylist(response.next, params);
  }

  private getAccessToken(): void {
    this.spotifyAuth.refreshAccessToken().then(data => this._spotifyApi.setAccessToken(data));
  }

  getGeneric(url: string, params?: any): Promise<object> {
    this.getAccessToken();
    return this._spotifyApi.getGeneric(url, params);
  }

  getTopArtists(): Promise<SpotifyApi.UsersTopArtistsResponse> {
    this.getAccessToken();
    return this._spotifyApi.getMyTopArtists();
  }

  getTopTracks(): Promise<SpotifyApi.UsersTopTracksResponse> {
    this.getAccessToken();
    return this._spotifyApi.getMyTopTracks();
  }

  async getAllTracksInPlaylist(playlistid: string, params?: any): Promise<string[][]> {
    this.getAccessToken();
    this.tracks = [];
    this.index = 0;
    const playlistResponse = await this._spotifyApi.getPlaylistTracks(playlistid, params);

    if (playlistResponse.next) {
      await this.continueRetrievingTracksOfPlaylist(playlistResponse.next, params);
    }

    return this.tracks;
  }

  getSeveralTracks(trackIds: string[], params?: any): Promise<SpotifyApi.MultipleTracksResponse> {
    this.getAccessToken();
    return this._spotifyApi.getTracks(trackIds, params);
  }
}
