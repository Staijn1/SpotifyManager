import {Component, ContentChild, EventEmitter, Input, Output, TemplateRef} from '@angular/core';

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

  /**
   * If the playlist has an image, use this image. Otherwise use picsum to generate a random image.
   * Returns an object with the src and href properties.
   * Href is the link to the playlist, to view in spotify webplayer
   * @param {SpotifyApi.PlaylistObjectSimplified} playlist
   * @param {number} index
   * @returns {{src: string, href: string}}
   */
  getImage(playlist: SpotifyApi.PlaylistObjectSimplified, index: number): { src: string; href: string } {
    if (playlist.images[0]) {
      return {
        src: playlist.images[0].url,
        href: playlist.external_urls.spotify,
      }
    }

    return {
      src: 'https://picsum.photos/200/200?random=' + index,
      href: playlist.external_urls.spotify,
    }
  }
}
