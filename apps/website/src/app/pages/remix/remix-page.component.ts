import { Component, HostListener, OnInit } from '@angular/core';
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons';
import { SpotifyAPIService } from '../../services/spotifyAPI/spotify-api.service';
import { ApiService } from '../../services/api/api.service';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SpotifyPlaylistComponent } from '../../components/spotify-playlist/spotify-playlist.component';
import { PlaylistObjectSimplified, Utils } from '@spotify-manager/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MessageService } from '../../services/message/message.service';
import { Message } from '../../types/Message';
import ListOfUsersPlaylistsResponse = SpotifyApi.ListOfUsersPlaylistsResponse;

@Component({
  selector: 'app-remix',
  standalone: true,
  templateUrl: './remix-page.component.html',
  styleUrls: ['./remix-page.component.scss'],
  imports: [
    LoadingComponent,
    SpotifyPlaylistComponent,
    FontAwesomeModule
  ]
})
export class RemixPageComponent implements OnInit {
  playlistResponse!: SpotifyApi.ListOfUsersPlaylistsResponse;
  isLoading = false;
  loadingPlaylists: { [id: string]: boolean } = {};

  remixIcon = faCompactDisc;

  /**
   * Inject the right dependencies
   * @param spotifyAPI
   * @param api
   * @param messageService
   */
  constructor(
    private readonly spotifyAPI: SpotifyAPIService,
    private readonly api: ApiService,
    private readonly messageService: MessageService) {
  }

  /**
   * On page load, load the necessary data
   */
  ngOnInit(): void {
    this.getPlaylists();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.getMorePlaylists();
    }
  }

  /**
   * Get the playlists for this user
   */
  getPlaylists(): void {
    this.isLoading = true;
    this.spotifyAPI.getUserPlaylist()
      .then(data => {
        this.playlistResponse = data as ListOfUsersPlaylistsResponse;
        // Filter out any remixed playlists
        this.playlistResponse.items = this.playlistResponse.items.filter(playlist => Utils.GetOriginalPlaylistIdFromDescription(playlist.description) === null);
      })
      .finally(() => this.isLoading = false);
  }

  /**
   * Get more playlists to show. The spotify API uses paging for playlists. This method gets the next page
   */
  getMorePlaylists(): void {
    if (!this.playlistResponse.next) return;
    this.isLoading = true;
    this.spotifyAPI.getGeneric(this.playlistResponse.next).then(data => {
        const playlistsFromPreviousPage = this.playlistResponse.items;
        this.playlistResponse = data as ListOfUsersPlaylistsResponse;
        this.playlistResponse.items = playlistsFromPreviousPage.concat(this.playlistResponse.items);

        // Filter out any remixed playlists
        this.playlistResponse.items = this.playlistResponse.items.filter(playlist => Utils.GetOriginalPlaylistIdFromDescription(playlist.description) === null);
      }
    ).finally(() => this.isLoading = false);
  }

  /**
   * Create a remix of the playlist, which is initially a copy of the playlist
   * @param playlist
   */
  remixPlaylist(playlist: PlaylistObjectSimplified) {
    this.loadingPlaylists[playlist.id] = true;
    this.api.remixPlaylist(playlist.id)
      .then(() => this.messageService.setMessage(new Message('success', `Successfully remixed "${playlist.name}"`)))
      .finally(() => this.loadingPlaylists[playlist.id] = false);
  }

  get playlistsNotOwnedByUser(): PlaylistObjectSimplified[] {
    return this.playlistResponse?.items.filter(playlist => playlist.owner.id !== sessionStorage.getItem('userId')) ?? [];
  }
}
