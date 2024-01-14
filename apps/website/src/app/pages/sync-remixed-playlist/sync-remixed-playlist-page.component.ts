import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation, Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Diff } from '@spotify-manager/core';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SpotifyTrackComponent } from '../../components/spotify-track/spotify-track.component';

@Component({
  selector: 'app-sync-remixed-playlist-page',
  standalone: true,
  imports: [CommonModule, LoadingComponent, SpotifyTrackComponent],
  templateUrl: './sync-remixed-playlist-page.component.html',
  styleUrl: './sync-remixed-playlist-page.component.scss'
})
export class SyncRemixedPlaylistPageComponent {
  private leftPlaylistId !: string;
  private rightPlaylistId!: string;

  changes: Diff[] = [];
  syncedResult: Diff[] = [];
  isLoading = false;

  constructor(
    private readonly router: Router,
    private apiService: ApiService
  ) {
    const nav: Navigation | null = this.router.getCurrentNavigation();

    if (nav?.extras && nav.extras.state) {
      this.leftPlaylistId = nav.extras.state['leftPlaylistId'];
      this.rightPlaylistId = nav.extras.state['rightPlaylistId'];

      this.compareLeftPlaylistToRightPlaylist();
    } else {
      // This page cannot be viewed without a redirect from another page, supplying the right parameters
      this.router.navigate(['/account']);
      return;
    }
  }

  private compareLeftPlaylistToRightPlaylist() {
    this.isLoading = true;
    this.apiService.comparePlaylists(this.leftPlaylistId, this.rightPlaylistId)
      .then(changes => {
        this.changes = changes;
        this.putUnchangedTracksInSyncedResult();
      })
      .finally(() => this.isLoading = false);
  }

  private putUnchangedTracksInSyncedResult() {
    this.syncedResult = this.changes.filter(change => change[0] === 0);
    console.log(this.syncedResult[0][1])
  }
}
