import {Component, HostListener, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CurrentUsersProfileResponse,
  ListOfUsersPlaylistsResponse,
  PlaylistObjectSimplified
} from "@spotify-manager/core";
import {FormsModule} from "@angular/forms";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {LoadingComponent} from "../../../components/loading/loading.component";
import {SpotifyPlaylistComponent} from "../../../components/spotify-playlist/spotify-playlist.component";
import {faCompactDisc} from "@fortawesome/free-solid-svg-icons";
import {SpotifyAPIService} from "../../../services/spotifyAPI/spotify-api.service";
import {Store} from "@ngrx/store";
import {SpotifyManagerUserState} from "../../../types/SpotifyManagerUserState";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-dj-mode',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent, LoadingComponent, SpotifyPlaylistComponent, RouterLink],
  templateUrl: './dj-mode-page.component.html',
  styleUrl: './dj-mode-page.component.scss',
})
export class DjModePageComponent implements OnInit {
  readonly remixIcon = faCompactDisc;
  playlistResponse!: SpotifyApi.ListOfUsersPlaylistsResponse;
  isLoading = false;

  user: CurrentUsersProfileResponse | null | undefined;

  /**
   * Inject the right dependencies
   * @param spotifyAPI
   * @param store
   */
  constructor(
    private readonly spotifyAPI: SpotifyAPIService,
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

  get playlistsOwnedByUser(): PlaylistObjectSimplified[] {
    return this.playlistResponse?.items.filter(playlist => playlist.owner.id === this.user?.id) ?? [];
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
}
