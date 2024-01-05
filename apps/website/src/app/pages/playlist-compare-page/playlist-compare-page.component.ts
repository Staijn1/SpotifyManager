import {Component, ViewChild} from '@angular/core';
import {Navigation, Router} from '@angular/router';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import {Diff} from '@spotify/data';
import {
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faThumbTack,
  faTimes,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {NgbNav} from '@ng-bootstrap/ng-bootstrap';
import {AudioService} from "../../services/audioService/audio.service";
import ArtistObjectFull = SpotifyApi.ArtistObjectFull;

@Component({
  selector: 'app-playlist-compare-page',
  templateUrl: './playlist-compare-page.component.html',
  styleUrls: ['./playlist-compare-page.component.scss'],
})
export class PlaylistComparePageComponent {
  @ViewChild(NgbNav) nav!: NgbNav;
  error: CustomError | undefined;

  private remixedPlaylistBasic: SpotifyApi.PlaylistObjectSimplified | undefined;
  private readonly originalPlaylistId: string | undefined;
  private readonly versionTimestamp: number | undefined;
  readonly loadingIcon = faSpinner;
  readonly pinnedIcon = faThumbTack;
  readonly keepRemovedIcon = faTimes;
  changesInRemix: Diff[] = [];
  changesInOriginal: Diff[] = [];
  mergedChanges: Diff[] = [];
  activeTab = 1;
  isLoading = false;
  isSyncing = false;

  /**
   * Inject dependencies and start the compare process
   * @param router
   * @param {ApiService} apiService
   * @param audioService
   */
  constructor(private readonly router: Router, private apiService: ApiService, private readonly audioService: AudioService) {
    const nav: Navigation | null = this.router.getCurrentNavigation();

    // This page cannot be viewed without a redirect from another page, supplying the right parameters
    if (!nav) {
      this.router.navigate(['/account']);
      return;
    }

    if (nav.extras && nav.extras.state) {
      this.remixedPlaylistBasic = nav.extras.state['remixedPlaylist'];
      this.originalPlaylistId = nav.extras.state['originalPlaylistId'];
      this.versionTimestamp = nav.extras.state['versionTimestamp'];

      this.compareRemixToOriginal();
    } else {
      // This page cannot be viewed without a redirect from another page, supplying the right parameters
      this.router.navigate(['/account']);
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
  private compareRemixToOriginal(): void {
    this.isLoading = true;

    const promises = [
      this.apiService.comparePlaylists(this.remixedPlaylistBasic?.id as string, this.originalPlaylistId as string, this.versionTimestamp),
      this.apiService.comparePlaylists(this.originalPlaylistId as string, this.originalPlaylistId as string, this.versionTimestamp)
    ];

    Promise.all(promises)
      .then(changes => {
        this.changesInRemix = changes[0];
        this.changesInOriginal = changes[1];
        this.mergeChanges(this.changesInOriginal, this.changesInRemix);
      })
      .catch(e => this.error = e)
      .finally(() => this.isLoading = false);
  }

  /**
   * Merge the two lists of diffs
   * For a diff to make it into the merged list, the diff must be 0 'unchanged' in both lists
   * @param {Diff[]} changesInOriginal
   * @param {Diff[]} changesInRemix
   * @private
   */
  private mergeChanges(changesInOriginal: Diff[], changesInRemix: Diff[]) {
    this.mergedChanges = [];
    for (let i = 0; i < changesInOriginal.length; i++) {
      const originalDiff = changesInOriginal[i];
      const remixDiff = changesInRemix[i];
      if (originalDiff[0] === 0 && remixDiff[0] === 0) {
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
    this.audioService.stopCurrentAudio();
    // Create a copy of the diff, so we can change it's state to 1 'inserted'
    const copy = Object.assign({}, diff);
    copy[0] = 1;

    // Insert the copy at the correct position
    this.mergedChanges.splice(index, 0, copy);

    // Then find the diff in both lists and set its state to 0 'unchanged'
    const findDiffPredicate = (d: Diff) => d[1].track.id === diff[1].track.id;
    const foundChangeInOriginal = this.changesInOriginal.find(findDiffPredicate);
    const foundChangeInRemix = this.changesInRemix.find(findDiffPredicate);
    if (foundChangeInOriginal) foundChangeInOriginal[0] = 0;
    if (foundChangeInRemix) foundChangeInRemix[0] = 0;
  }

  /**
   * Fired when you want to keep a song removed
   * @param {Diff} diff
   */
  onKeepRemoved(diff: Diff) {
    this.audioService.stopCurrentAudio();
    diff[0] = 0;
  }

  /**
   * Change the tab. Parameter -1 means previous tab, 1 means next tab
   * If the new tab index is out of bounds, roll-over to the other side
   * @param {-1 | 1} nextOrPrevious
   */
  changeTab(nextOrPrevious: -1 | 1): void {
    let newTab = this.activeTab + nextOrPrevious;
    if (newTab < 1) newTab = this.nav.items.length;
    if (newTab > this.nav.items.length) newTab = 1;
    this.nav.select(newTab);
  }

  /**
   * When user is done merging, this function is called
   */
  syncPlaylist(): void {
    this.isSyncing = true;
    const mergedTracks = this.mergedChanges.map(d => d[1].track);
    this.apiService.syncPlaylist(this.originalPlaylistId as string,this.remixedPlaylistBasic?.id as string, mergedTracks)
      .then()
      .catch(e => this.error = e)
      .finally(() => this.isSyncing = false);
  }

  /**
   * Generate a string to visualize the artists of the track in a nice way
   * @param playlistTrack
   * @returns {any}
   */
  generateArtistList(playlistTrack: any) {
    //todo do this
    console.warn('Using any type, but types are conflicting. Please fix asap.')
    return playlistTrack.track.album.artists.map((artist: ArtistObjectFull) => `${artist.name}`).join(', ')
  }

  /**
   * Returns true when the original playlist has been changed after it has been remixed
   */
  get originalPlaylistHasChanged(): boolean {
    return this.changesInOriginal.filter(diff => diff[0] !== 0).length !== 0
  }
}
