import {Component, OnInit} from '@angular/core';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-fork-sync',
  templateUrl: './fork-sync.component.html',
  styleUrls: ['./fork-sync.component.scss']
})
export class ForkSyncComponent implements OnInit {
  playlists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  loading = faSpinner;
  isLoading = false;
  readonly originalIdRegex = /\{([^}]+)\}/g;
  error: CustomError | undefined;

  /**
   * Inject the spotify API
   * @param {SpotifyAPIService} spotifyAPI
   * @param {ApiService} apiService
   * @param {Router} router
   */
  constructor(private readonly spotifyAPI: SpotifyAPIService, private readonly apiService: ApiService, private readonly router: Router) {
  }

  /**
   * Get playlists on page load
   */
  ngOnInit(): void {
    this.isLoading = true;
    this.apiService.getAllUserPlaylists().then(data => {
      this.playlists = data;
      // The playlist must have a description with something like {6vDGVr652ztNWKZuHvsFvx} in it.
      // This is de ID of the original playlist. Without it, we cannot synchronize the playlist.
      this.playlists.items = data.items.filter(playlist => playlist.description?.match(this.originalIdRegex))
    }).finally(() => this.isLoading = false)
  }

  /**
   * Do something when the action has been clicked
   * @param {SpotifyApi.PlaylistObjectSimplified} playlist
   */
  onActionClick(playlist: SpotifyApi.PlaylistObjectSimplified) {
    //Extract the ID of the original playlist
    const fullOrignalId = playlist.description?.match(this.originalIdRegex) as string[];
    const originalId = fullOrignalId[0].replace('{', '').replace('}', '');
    this.router.navigate(['compare', playlist.id, originalId]);
  }
}
