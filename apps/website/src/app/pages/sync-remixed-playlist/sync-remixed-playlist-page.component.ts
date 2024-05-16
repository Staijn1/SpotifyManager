import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SpotifyTrackComponent } from '../../components/spotify-track/spotify-track.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Diff, DiffIdentifier, SinglePlaylistResponse } from '@spotify-manager/core';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Navigation, Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { MessageService } from '../../services/message/message.service';
import { Message } from '../../types/Message';
import _ from 'lodash';

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

  originalPlaylist: SinglePlaylistResponse | undefined;

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

  private async load() {
    this.isComparisonLoading = true;
    // Fetch playlist details as the first step
    await this.fetchPlaylistDetails();
    this.apiService.comparePlaylists(this.originalPlaylistId, this.remixedPlaylistId)
      .then(changes => {
        // Automatically build the draft synced playlist with tracks that are:
        // - Added in the remix
        // - Added in the original
        // - Added in both
        // - Unchanged
        const diffs = changes.filter(change => {
          return [DiffIdentifier.ADDED_IN_REMIX, DiffIdentifier.ADDED_IN_ORIGINAL, DiffIdentifier.UNCHANGED, DiffIdentifier.ADDED_IN_BOTH].includes(change[0]);
        });
        this.draftSyncedPlaylist = this.sortDiffs(diffs, true);
        // The changed tracks are then the ones that are in the list of changes, but not in the draft synced playlist
        this.changedTracks = _.differenceWith(changes, this.draftSyncedPlaylist, (a: Diff, b: Diff) => a[1].track.id === b[1].track.id);
      }).finally(() => this.isComparisonLoading = false);
  }

  private async fetchPlaylistDetails() {
    // Fetch the original playlist details
    this.originalPlaylist = await this.apiService.getPlaylist(this.originalPlaylistId);
  }

  /**
   * Moves a missing song from the original playlist to the synced playlist draft
   * @param diff
   */
  addTrackToPreviewSyncedPlaylist(diff: Diff) {
    // Add the diff to the synced playlist draft at the top
    this.draftSyncedPlaylist.unshift(diff);
    this.changedTracks = this.changedTracks.filter(missingSong => missingSong[1].track.id !== diff[1].track.id);
  }

  /**
   * Moves a song from the synced playlist draft to the missing songs in the original playlist
   * @param diff
   */
  removeTrackFromPreviewSyncedPlaylist(diff: Diff) {
    // Add the diff to the missing songs in the original playlist at the top
    this.changedTracks.unshift(diff);
    this.draftSyncedPlaylist = this.draftSyncedPlaylist.filter(missingSong => missingSong[1].track.id !== diff[1].track.id);
  }

  /**
   * Sorts the diffs so added tracks are at the top, then deleted and then the remaining unchanged tracks
   * @param diffs
   * @param changedTracksOnTop Determines if a changed track should end up at the top or bottom of the list
   * @private
   */
  private sortDiffs(diffs: Diff[], changedTracksOnTop: boolean): Diff[] {
    const copy = [...diffs];
    copy.sort((a, b) => {
      if (a[0] === b[0]) return 0; // If both have the same status, no need to change order
      if (a[0] !== DiffIdentifier.UNCHANGED) return changedTracksOnTop ? -1 : 1; // Changed tracks go to the top or bottom based on the flag
      return changedTracksOnTop ? 1 : -1; // Unchanged tracks go to the bottom or top based on the flag
    });
    return copy;
  }

  /**
   * Turns the draft synced playlist into the real remixed playlist.
   * After this is done, the remixed playlist is synced to the original playlist.
   */
  syncPlaylist() {
    this.isSyncing = true;
    const sortedDraftSyncedPlaylist = this.sortDiffs(this.draftSyncedPlaylist, false);

    this.apiService.syncPlaylist(this.originalPlaylistId, this.remixedPlaylistId, sortedDraftSyncedPlaylist.map(diff => diff[1].track)).then(() => {
      this.router.navigate(['/remix-overview']);
      this.messageService.setMessage(new Message('success', 'The playlist has been synced!'));
    }).finally(() => this.isSyncing = false);
  }

  getDiffIdentifierText(diffElement: DiffIdentifier): string {
    switch (diffElement) {
      case DiffIdentifier.ADDED_IN_REMIX:
        return 'Added in remix';
      case DiffIdentifier.REMOVED_IN_REMIX:
        return 'Removed in remix';
      case DiffIdentifier.UNCHANGED:
        return 'Unchanged';
      case DiffIdentifier.ADDED_IN_ORIGINAL:
        return 'Added in original';
      case DiffIdentifier.REMOVED_IN_ORIGINAL:
        return 'Removed in original';
      default:
        return 'Unknown DiffIdentifier';
    }
  }

  getClassForDiff(diff: DiffIdentifier) {
    switch (diff) {
      case DiffIdentifier.UNCHANGED:
        return 'unchanged';
      case DiffIdentifier.REMOVED_IN_REMIX:
      case DiffIdentifier.REMOVED_IN_ORIGINAL:
        return 'deleted';
      case DiffIdentifier.ADDED_IN_REMIX:
      case DiffIdentifier.ADDED_IN_BOTH:
      case DiffIdentifier.ADDED_IN_ORIGINAL:
        return 'added';
      default:
        return 'unknown-diff-' + diff;
    }
  }
}
