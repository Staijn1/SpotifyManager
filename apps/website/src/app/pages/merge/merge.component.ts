import {Component, OnInit} from '@angular/core';
import {faSpinner, faSync} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';

@Component({
  selector: 'app-merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.scss']
})
export class MergeComponent implements OnInit {
  playlists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  playlistsToMerge: string[] = [];
  playlistName!: string;
  loading = faSpinner;
  isLoading = false;
  refreshIcon = faSync;

  error: CustomError | undefined;

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
