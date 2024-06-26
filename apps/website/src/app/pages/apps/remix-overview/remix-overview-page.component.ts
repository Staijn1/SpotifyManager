import { Component, OnInit } from '@angular/core';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { PlaylistObjectSimplified } from '@spotify-manager/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import ListOfUsersPlaylistsResponse = SpotifyApi.ListOfUsersPlaylistsResponse;
import { LoadingComponent } from '../../../components/loading/loading.component';
import { SpotifyPlaylistComponent } from '../../../components/spotify-playlist/spotify-playlist.component';
import { ApiService } from '../../../services/api/api.service';

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
  remixedPlaylists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  isLoading = false;

  readonly syncIcon = faSync;

  /**
   * Inject the right dependencies
   * @param api
   * @param router
   */
  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {
  }

  /**
   * On page load, load the necessary data
   */
  ngOnInit(): void {
    this.getRemixedPlaylists();
  }

  /**
   * Get the remixed playlists for this user
   */
  getRemixedPlaylists(): void {
    this.isLoading = true;
    this.api.getMyRemixedPlaylists()
      .then(data => this.remixedPlaylists = data as ListOfUsersPlaylistsResponse)
      .finally(() => this.isLoading = false);
  }

  /**
   * Redirect to the synchronizing page with the right parameters
   * @param remixedPlaylist
   */
  startComparingPlaylist(remixedPlaylist: PlaylistObjectSimplified) {
    this.router.navigate(['/apps/sync-remixed-playlist', remixedPlaylist.id]);
  }
}
