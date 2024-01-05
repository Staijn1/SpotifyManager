import {Component, OnInit, ViewChild} from '@angular/core';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import {Router} from '@angular/router';
import {RemixedPlaylistInformation} from '@spotify/data';
import {ModalComponent} from '../../components/modal/modal.component';

@Component({
  selector: 'app-remix-sync',
  templateUrl: './remix-sync.component.html',
  styleUrls: ['./remix-sync.component.scss']
})
export class RemixSyncComponent implements OnInit {
  @ViewChild(ModalComponent) modal!: ModalComponent
  playlists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  loading = faSpinner;
  isLoading = false;
  readonly originalIdRegex = /\{([^}]+)\}/g;
  error: CustomError | undefined;
  versions: RemixedPlaylistInformation[] = [];
  private selectedPlaylist: SpotifyApi.PlaylistObjectSimplified | undefined;
  private originalPlaylistId: string | undefined;

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
    this.selectedPlaylist = playlist;
    //Extract the ID of the original playlist
    const fullOrignalId = playlist.description?.match(this.originalIdRegex) as string[];
    this.originalPlaylistId = fullOrignalId[0].replace('{', '').replace('}', '');
    this.apiService.getRemixedPlaylistInformation(this.originalPlaylistId).then(data => {
      this.versions = data;
      this.versions.sort((a, b) => b.createdOn - a.createdOn);
      if (data.length > 1) {
        this.openPopup();
      } else {
        this.startComparingPlaylist()
      }
    })
  }

  /**
   * Open a modal to allow the user to pick which version of the original playlist to use in comparing
   * @param {RemixedPlaylistInformation[]} data
   * @private
   */
  private openPopup() {
    this.modal.open()
  }

  /**
   * Navigate to the compare page, passing the remixed playlist. Optionally, a timestamp is passed of a specific version of the original playlist
   * @param {SpotifyApi.PlaylistObjectSimplified} playlist
   * @param {number} versionTimestamp
   */
  startComparingPlaylist(versionTimestamp?: number) {
    this.router.navigate(['playlists/compare'], {
      state: {
        remixedPlaylist: this.selectedPlaylist,
        originalPlaylistId: this.originalPlaylistId,
        versionTimestamp: versionTimestamp
      }
    }).then(() => this.modal.close());
  }
}
