import {Component} from '@angular/core';
import {Navigation, Router} from '@angular/router';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import {Diff} from '@spotify/data';
import {createMockForkDiff, createMockOriginalDiff} from '../../mocks';
import {faChevronLeft, faChevronRight, faTimes, IconDefinition} from '@fortawesome/free-solid-svg-icons';
import {IconProp} from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-playlist-compare-page',
  templateUrl: './playlist-compare-page.component.html',
  styleUrls: ['./playlist-compare-page.component.scss'],
})
export class PlaylistComparePageComponent {
  error: CustomError | undefined;

  private forkedPlaylistBasic: SpotifyApi.PlaylistObjectSimplified | undefined;
  private originalPlaylistId: string | undefined;
  private versionTimestamp: number | undefined;
  changesInFork: Diff[] = [];
  changesInOriginal: Diff[] = [];
  mergedChanges: Diff[] = [];
  keepRemovedIcon = faTimes;

  /**
   * Inject dependencies and start the compare process
   * @param router
   * @param {ApiService} apiService
   */
  constructor(private readonly router: Router, private apiService: ApiService) {
    const nav: Navigation | null = this.router.getCurrentNavigation();

    // This page cannot be viewed without a redirect from another page, supplying the right parameters
    if (!nav) {
      this.router.navigate(['/account']);
      return;
    }

    if (nav.extras && nav.extras.state) {
      this.forkedPlaylistBasic = nav.extras.state['forkedPlaylist'];
      this.originalPlaylistId = nav.extras.state['originalPlaylistId'];
      this.versionTimestamp = nav.extras.state['versionTimestamp'];

      this.compareForkedPlaylistToOriginal();
    } else {
      // This page cannot be viewed without a redirect from another page, supplying the right parameters
      // this.router.navigate(['/account']);
      this.compareForkedPlaylistToOriginal()
      return;
    }
  }

  /**
   * Determine the css classes for the diff.
   * @param {[number, string]} diff
   * @returns {string}
   */
  determineCSSClass(diff: Diff): string {
    switch (diff[0]) {
      case 0:
        return 'equal';
      case 1:
        return 'inserted';
      case -1:
        return 'removed';
      default:
        return 'unknown';
    }
  }

  /**
   * Compare the playlist to another
   * @private
   */
  private compareForkedPlaylistToOriginal(): void {
    this.changesInFork = createMockForkDiff()
    this.changesInOriginal = createMockOriginalDiff()
    /*this.apiService.comparePlaylists(this.forkedPlaylistBasic?.id as string, this.originalPlaylistId as string, this.versionTimestamp).then(changesFork => {
      this.changesInFork = changesFork;
      return this.apiService.comparePlaylists(this.originalPlaylistId as string, this.originalPlaylistId as string, this.versionTimestamp)
    }).then(changesOriginal => {
      this.changesInOriginal = changesOriginal;
      this.mergeChanges(this.changesInOriginal, this.changesInFork);
    })*/
    this.mergeChanges(this.changesInOriginal, this.changesInFork);
  }

  /**
   * Merge the two lists of diffs
   * For a diff to make it into the merged list, the diff must be 0 'unchanged' in both lists
   * @param {Diff[]} changesInOriginal
   * @param {Diff[]} changesInFork
   * @private
   */
  private mergeChanges(changesInOriginal: Diff[], changesInFork: Diff[]) {
    this.mergedChanges = [];
    for (let i = 0; i < changesInOriginal.length; i++) {
      const originalDiff = changesInOriginal[i];
      const forkDiff = changesInFork[i];
      if (originalDiff[0] === 0 && forkDiff[0] === 0) {
        this.mergedChanges.push(originalDiff);
      }
    }

  }

  /**
   * Determine the direction of the icon, pointing left or right?
   * @param {"left" | "right" | undefined} direction
   * @returns {IconDefinition}
   */
  determineAddBackIcon(direction: 'left' | 'right'): IconProp {
    switch (direction) {
      case 'left':
        return faChevronLeft
      case 'right':
        return faChevronRight
      default:
        throw Error(`Invalid direction: ${direction}`);
    }
  }

  /**
   * Fired when adding a song back to the playlist.
   * Insert the song at the correct position.
   * @param {Diff} diff
   * @param {number} index
   */
  onAddBackAction(diff: Diff, index: number): void {
    // Create a copy of the diff, so we can change it's state to 1 'inserted'
    const copy = Object.assign({}, diff);
    copy[0] = 1;

    // Insert the copy at the correct position
    this.mergedChanges.splice(index, 0, copy);

    // Then find the diff in both lists and set its state to 0 'unchanged'
    const findDiffPredicate = (d: Diff) => d[1].track.id === diff[1].track.id;
    const foundChangeInOriginal = this.changesInOriginal.find(findDiffPredicate);
    const foundChangeInFork = this.changesInFork.find(findDiffPredicate);
    if (foundChangeInOriginal) foundChangeInOriginal[0] = 0;
    if (foundChangeInFork) foundChangeInFork[0] = 0;
  }

  /**
   * Fired when you want to keep a song removed
   * @param {Diff} diff
   */
  onKeepRemoved(diff: Diff) {
    diff[0] = 0;
  }

  /**
   * When user is done merging, this function is called
   */
  syncPlaylist(): void {
    const mergedTracks = this.mergedChanges.map(d => d[1].track);
    this.apiService.syncPlaylist(this.forkedPlaylistBasic?.id as string, mergedTracks).then().catch(e => this.error = e);
  }
}
