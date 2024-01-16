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

  missingSongsInOriginal: Diff[] = [];
  draftSyncedPlaylist: Diff[] = [];
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
        const sortedChanges = this.sortDiffs(changes);
        this.missingSongsInOriginal = sortedChanges.filter(change => change[0] === -1);
        this.draftSyncedPlaylist = sortedChanges.filter(change => change[0] !== -1);
      }).finally(() => this.isLoading = false);
  }

  /**
   * Moves a missing song from the original playlist to the synced playlist draft
   * @param diff
   */
  addTrackToPreviewSyncedPlaylist(diff: Diff) {
    this.draftSyncedPlaylist.push(diff);
    this.draftSyncedPlaylist = this.sortDiffs(this.draftSyncedPlaylist);
    this.missingSongsInOriginal = this.missingSongsInOriginal.filter(missingSong => missingSong[1].track.id !== diff[1].track.id);

  }

  /**
   * Moves a song from the synced playlist draft to the missing songs in the original playlist
   * @param diff
   */
  removeTrackFromPreviewSyncedPlaylist(diff: Diff) {
    this.missingSongsInOriginal.push(diff);
    this.missingSongsInOriginal = this.sortDiffs(this.draftSyncedPlaylist);
    this.draftSyncedPlaylist = this.draftSyncedPlaylist.filter(missingSong => missingSong[1].track.id !== diff[1].track.id);
  }

  /**
   * Sorts the diffs so added tracks are at the top, then deleted and then the remaining unchanged tracks
   * @param diffs
   * @private
   */
  private sortDiffs(diffs: Diff[]): Diff[] {
    const copy = [...diffs];
    copy.sort((a, b) => {
      if (a[0] === b[0]) return 0; // If both have the same status, no need to change order
      if (a[0] !== 0) return -1; // Changed tracks go to the top
      if (b[0] != 0) return 1; // Changed tracks go to the top
      return 0; // Unchanged tracks go to the bottom
    });
    return copy;
  }
}
