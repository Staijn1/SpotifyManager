import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons';
import { CurrentUsersProfileResponse, PlaylistObjectSimplified } from '@spotify-manager/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Store } from '@ngrx/store';
import ListOfUsersPlaylistsResponse = SpotifyApi.ListOfUsersPlaylistsResponse;
import { SpotifyAPIService } from '../../../services/spotifyAPI/spotify-api.service';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { SpotifyPlaylistComponent } from '../../../components/spotify-playlist/spotify-playlist.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ApiService } from '../../../services/api/api.service';
import { MessageService } from '../../../services/message/message.service';
import { SpotifyManagerUserState } from '../../../types/SpotifyManagerUserState';
import { Message } from '../../../types/Message';



@Component({
  selector: 'app-remix',
  standalone: true,
  templateUrl: './remix-page.component.html',
  styleUrls: ['./remix-page.component.scss'],
  imports: [
    LoadingComponent,
    SpotifyPlaylistComponent,
    FontAwesomeModule,
    ModalComponent
  ]
})
export class RemixPageComponent implements OnInit {
  @ViewChild(ModalComponent) private modal!: ModalComponent;
  readonly remixIcon = faCompactDisc;
  playlistResponse!: SpotifyApi.ListOfUsersPlaylistsResponse;
  isLoading = false;

  playlistAboutToBeRemixed: PlaylistObjectSimplified | undefined;
  user: CurrentUsersProfileResponse | null | undefined;

  /**
   * Inject the right dependencies
   * @param spotifyAPI
   * @param api
   * @param messageService
   * @param store
   */
  constructor(
    private readonly spotifyAPI: SpotifyAPIService,
    private readonly api: ApiService,
    private readonly messageService: MessageService,
    private readonly store: Store<{ userState: SpotifyManagerUserState }>) {
    this.store.select('userState').subscribe(userState => {
      this.user = userState.user;
    });
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

  get playlistsNotOwnedByUser(): PlaylistObjectSimplified[] {
    return this.playlistResponse?.items.filter(playlist => playlist.owner.id !== this.user?.id) ?? [];
  }

  /**
   * Get the playlists for this user
   */
  getPlaylists(): void {
    this.isLoading = true;
    this.spotifyAPI.getUserPlaylist()
      .then(data => {
        this.playlistResponse = data as ListOfUsersPlaylistsResponse;
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
      }
    ).finally(() => this.isLoading = false);
  }

  /**
   * Create a remix of the playlist, which is initially a copy of the playlist
   * @param playlist
   * @param ignoreNotificationsForPlaylist
   */
  remixPlaylist(playlist: PlaylistObjectSimplified, ignoreNotificationsForPlaylist: boolean) {
    this.isLoading = true;
    this.api.remixPlaylist(playlist.id, ignoreNotificationsForPlaylist)
      .then(() => {
        this.modal.close();
        this.messageService.setMessage(new Message('success', `Successfully remixed "${playlist.name}"`));
      })
      .finally(() => this.isLoading = false);
  }

  openModal(playlist: PlaylistObjectSimplified) {
    this.playlistAboutToBeRemixed = playlist;
    this.modal.open();
  }
}
