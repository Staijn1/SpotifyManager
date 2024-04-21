import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SpotifyTrackComponent } from '../../components/spotify-track/spotify-track.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Diff, DiffIdentifier } from '@spotify-manager/core';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Navigation, Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { MessageService } from '../../services/message/message.service';
import { Message } from '../../types/Message';

@Component({
  selector: 'app-sync-remixed-playlist-page',
  standalone: true,
  imports: [CommonModule, LoadingComponent, SpotifyTrackComponent, FaIconComponent],
  templateUrl: './sync-remixed-playlist-page.component.html',
  styleUrl: './sync-remixed-playlist-page.component.scss'
})
export class SyncRemixedPlaylistPageComponent {
  readonly DiffIdentifier = DiffIdentifier;
  private remixedPlaylistId !: string;
  private originalPlaylistId!: string;

  changedTracks: Diff[] = [];
  draftSyncedPlaylist: Diff[] = [];
  isComparisonLoading = false;
  arrowRightIcon = faArrowRight;
  arrowLeftIcon = faArrowLeft;
  isSyncing = false;
    constructor(
      private readonly router: Router,
      private apiService: ApiService,
      private readonly messageService: MessageService
    ) {
      const nav: Navigation | null = this.router.getCurrentNavigation();

      if (nav?.extras && nav.extras.state) {
        this.remixedPlaylistId = nav.extras.state['remixedPlaylistId'];
        this.originalPlaylistId = nav.extras.state['originalPlaylistId'];

        this.load();
      } else {
        // This page cannot be viewed without a redirect from another page, supplying the right parameters
        this.router.navigate(['/account']);
        return;
      }
    }

    private load() {
      this.isComparisonLoading = true;
      this.apiService.comparePlaylists(this.originalPlaylistId, this.remixedPlaylistId)
        .then(changes => {
          this.changedTracks = changes.filter(change => change[0] !== DiffIdentifier.UNCHANGED);
          this.draftSyncedPlaylist = changes.filter(change => change[0] === DiffIdentifier.UNCHANGED);
        }).finally(() => this.isComparisonLoading = false);
    }

    /**
     * Moves a missing song from the original playlist to the synced playlist draft
     * @param diff
     */
    addTrackToPreviewSyncedPlaylist(diff: Diff) {
      diff[0] = DiffIdentifier.ADDED_IN_REMIX; // todo confirm this is the correct identifier
      // Add the diff to the synced playlist draft at the top
      this.draftSyncedPlaylist.unshift(diff);
      this.draftSyncedPlaylist = this.sortDiffs(this.draftSyncedPlaylist);
      this.changedTracks = this.changedTracks.filter(missingSong => missingSong[1].track.id !== diff[1].track.id);
    }

    /**
     * Moves a song from the synced playlist draft to the missing songs in the original playlist
     * @param diff
     */
    removeTrackFromPreviewSyncedPlaylist(diff: Diff) {
      diff[0] = DiffIdentifier.REMOVED_IN_REMIX; // todo confirm this is the correct identifier
      // Add the diff to the missing songs in the original playlist at the top
      this.changedTracks.unshift(diff);
      this.changedTracks = this.sortDiffs(this.changedTracks);
      this.draftSyncedPlaylist = this.draftSyncedPlaylist.filter(missingSong => missingSong[1].track.id !== diff[1].track.id);
    }

    /**
     * Sorts the diffs so added tracks are at the top, then deleted and then the remaining unchanged tracks
     * todo fix with new identifiers
     * @param diffs
     * @private
     */
    private sortDiffs(diffs: Diff[]): Diff[] {
      const copy = [...diffs];
      copy.sort((a, b) => {
        if (a[0] === b[0]) return 0; // If both have the same status, no need to change order
        if (a[0] !== DiffIdentifier.UNCHANGED) return -1; // Changed tracks go to the top
        return 0; // Unchanged tracks go to the bottom
      });
      return copy;
    }

    /**
     * Turns the draft synced playlist into the real remixed playlist.
     * After this is done, the remixed playlist is synced to the original playlist.
     */
    syncPlaylist() {
      this.isSyncing = true;
      this.apiService.syncPlaylist(this.originalPlaylistId, this.remixedPlaylistId, this.draftSyncedPlaylist.map(diff => diff[1].track)).then(() => {
        this.router.navigate(['/remix-overview']);
        this.messageService.setMessage(new Message('success', 'The playlist has been synced!'))
      }).finally(() => this.isSyncing = false);
    }
}
