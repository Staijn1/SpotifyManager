import {Component, ContentChild, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-playlist-overview',
  templateUrl: './playlist-overview.component.html',
  styleUrls: ['./playlist-overview.component.scss'],
})
export class PlaylistOverviewComponent {
  @ContentChild('action') action!: TemplateRef<any>;
  @Input() playlists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  @Output() requestMore = new EventEmitter();
  @Output() actionClick = new EventEmitter<SpotifyApi.PlaylistObjectSimplified>();
  isLoading = false;
  loading = faSpinner;

  /**
   * Fires when the user requests more playlists.
   */
  requestMorePlaylists() {
    this.requestMore.emit();
  }

  /**
   * Fires when the user clicks on the projected content
   * @param {SpotifyApi.PlaylistObjectSimplified} playlist
   */
  onActionClick(playlist: SpotifyApi.PlaylistObjectSimplified) {
    this.actionClick.emit(playlist)
  }
}
