import {Component, OnInit} from '@angular/core';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';

@Component({
  selector: 'app-fork-sync',
  templateUrl: './fork-sync.component.html',
  styleUrls: ['./fork-sync.component.scss']
})
export class ForkSyncComponent implements OnInit {
  playlists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  loading = faSpinner;
  isLoading = false;

  error: CustomError | undefined;

  /**
   * Inject the spotify API
   * @param {SpotifyAPIService} spotifyAPI
   */
  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  /**
   * Get playlists on page load
   */
  ngOnInit(): void {
    this.getPlaylist();
  }

  /**
   * Get the playlists of the logged in user
   */
  getPlaylist(): void {
    this.isLoading = true;
    this.spotifyAPI.getUserPlaylist({limit: 50}).then(data => {
      this.playlists = data;
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      console.error(err);
    });
  }

  /**
   * The spotify api sends the playlist back in pages. When the "load more" button is pressed, this function will call the next page from the API
   */
  getMorePlaylists(): void {
    this.isLoading = true;
    this.spotifyAPI.getGeneric(this.playlists.next).then(
      data => {
        this.isLoading = false;
        const currentPlaylists = this.playlists.items;
        this.playlists = (data as SpotifyApi.ListOfUsersPlaylistsResponse);
        this.playlists.items = currentPlaylists.concat(this.playlists.items);
      }
    ).catch(err => {
      this.error = JSON.parse(err.response).error as CustomError;
    });
  }

  /**
   * Do something when the action has been clicked
   * @param {SpotifyApi.PlaylistObjectSimplified} playlist
   */
  onActionClick(playlist: SpotifyApi.PlaylistObjectSimplified) {
    console.log('action click', playlist);
  }
}
