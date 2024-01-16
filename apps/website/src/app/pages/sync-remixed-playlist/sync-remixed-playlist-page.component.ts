import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation, Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Diff, PlaylistTrackObject } from '@spotify-manager/core';
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

      this.load();
    } else {
      // This page cannot be viewed without a redirect from another page, supplying the right parameters
      this.router.navigate(['/account']);
      return;
    }
  }

  private load() {
    this.isLoading = true;


    this.apiService.comparePlaylists(this.leftPlaylistId, this.rightPlaylistId)
      .then(changes => {
        // Sort all changes so added tracks are at the top, then deleted and unchanged tracks
        changes.sort((a, b) => {
          if (a[0] === b[0]) return 0; // If both have the same status, no need to change order
          if (a[0] !== 0) return -1; // Changed tracks go to the top
          if (b[0] != 0) return 1; // Changed tracks go to the top
          return 0; // Unchanged tracks go to the bottom
        });
        this.changes = changes.filter(change => change[0] !== 0);
        this.putUnchangedTracksInSyncedResult(changes);
      }).finally(() => this.isLoading = false);
  }

  /**
   * Automatically put all unchanged songs to the synced result, which is the list of songs that will make it to the synced playlist
   * @param changes
   * @private
   */
  private putUnchangedTracksInSyncedResult(changes: Diff[]) {
    this.syncedResult = changes.filter(change => change[0] === 0);
  }
}
