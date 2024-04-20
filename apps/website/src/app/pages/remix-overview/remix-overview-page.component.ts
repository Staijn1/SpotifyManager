import { Component, HostListener, OnInit } from '@angular/core';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { SpotifyAPIService } from '../../services/spotifyAPI/spotify-api.service';
import { ApiService } from '../../services/api/api.service';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SpotifyPlaylistComponent } from '../../components/spotify-playlist/spotify-playlist.component';
import { PlaylistObjectSimplified, Utils } from '@spotify-manager/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import ListOfUsersPlaylistsResponse = SpotifyApi.ListOfUsersPlaylistsResponse;

@Component({
  selector: 'app-remix',
  standalone: true,
  templateUrl: './remix-overview-page.component.html',
  styleUrls: ['./remix-overview-page.component.scss'],
  imports: [
    LoadingComponent,
    SpotifyPlaylistComponent,
    FontAwesomeModule
  ]
})
export class RemixOverviewPageComponent implements OnInit {
  private readonly originalIdRegex = /\{([^}]+)\}/g;
  playlistResponse!: SpotifyApi.ListOfUsersPlaylistsResponse;
  isLoading = false;

  readonly syncIcon = faSync;

  /**
   * Inject the right dependencies
   * @param spotifyAPI
   * @param api
   * @param router
   */
  constructor(
    private readonly spotifyAPI: SpotifyAPIService,
    private readonly api: ApiService,
    private readonly router: Router
  ) {
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
      .then(data => this.playlistResponse = data as ListOfUsersPlaylistsResponse)
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

  get remixedPlaylists(): PlaylistObjectSimplified[] {
    return this.playlistResponse?.items.filter(playlist => playlist.description?.match(this.originalIdRegex)) ?? [];
  }

  /**
   * Redirect to the synchronizing page with the right parameters
   * @param playlist
   */
  startComparingPlaylist(playlist:PlaylistObjectSimplified){
    const remixedPlaylistId = playlist.id;
    // The left playlist is the remixed playlist, containing the original playlist ID in the description in the form of {playlistId}
    const originalPlaylistId = Utils.GetOriginalPlaylistIdFromDescription(playlist.description);


    this.router.navigate(['sync-remixed-playlist'], {
        state: {
          remixedPlaylistId: remixedPlaylistId,
          originalPlaylistId: originalPlaylistId,
        },
      })
  }
}
