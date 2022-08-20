import {Component} from '@angular/core';
import {ActivatedRoute, Navigation, Router} from '@angular/router';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import {Diff} from '@spotify/data';
import {createMockForkDiff, createMockOriginalDiff} from '../../mocks';
import {environment} from '../../../environments/environment';
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
  addBackIcon = faChevronRight;
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
      this.router.navigate(['/overview']);
      return;
    }

    if (nav.extras && nav.extras.state) {
      this.forkedPlaylistBasic = nav.extras.state['forkedPlaylist'];
      this.originalPlaylistId = nav.extras.state['originalPlaylistId'];
      this.versionTimestamp = nav.extras.state['versionTimestamp'];

      this.compareForkedPlaylistToOriginal();
    } else {
      // This page cannot be viewed without a redirect from another page, supplying the right parameters
      // this.router.navigate(['/overview']);
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
    })*/
    const unchangedPredicate = (diff: Diff) => diff[0] === 0;
    this.mergedChanges = this.changesInFork
      .filter(unchangedPredicate)
      .concat(
        this.changesInOriginal.filter(unchangedPredicate)
      )
  }

  /**
   * Determine the direction of the icon, pointing left or right?
   * @param {"left" | "right" | undefined} direction
   * @returns {IconDefinition}
   */
  determineAddBackIcon(direction: 'left' | 'right'):IconProp {
    switch (direction) {
      case 'left': return faChevronLeft
      case 'right': return faChevronRight
      default: throw Error(`Invalid direction: ${direction}`);
    }
  }
}
