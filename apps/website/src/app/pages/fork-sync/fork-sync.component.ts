import {Component, OnInit, ViewChild} from '@angular/core';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import {Router} from '@angular/router';
import {ForkedPlaylistInformation} from '@spotify/data';
import {ModalComponent} from '../../components/modal/modal.component';

@Component({
  selector: 'app-fork-sync',
  templateUrl: './fork-sync.component.html',
  styleUrls: ['./fork-sync.component.scss']
})
export class ForkSyncComponent implements OnInit {
  @ViewChild(ModalComponent) modal!: ModalComponent
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
    this.apiService.getForkedPlaylistInformation(originalId).then(data => {
      if (data.length > 1) {
        this.openPopup(data, playlist);
      } else {
        this.startComparingPlaylist(originalId, playlist)
      }
    })
  }

  /**
   * Open a modal to allow the user to pick which version of the original playlist to use in comparing
   * @param {ForkedPlaylistInformation[]} data
   * @private
   */
  private openPopup(data: ForkedPlaylistInformation[], playlist: SpotifyApi.PlaylistObjectSimplified) {
    this.modal.open()
  }

  /**
   * Navigate to the compare page
   * @param {string} originalId
   * @param {SpotifyApi.PlaylistObjectSimplified} playlist
   * @private
   */
  private startComparingPlaylist(originalId: string, playlist: SpotifyApi.PlaylistObjectSimplified) {
    this.router.navigate(['playlists/compare', originalId, playlist.id]);
  }
}
