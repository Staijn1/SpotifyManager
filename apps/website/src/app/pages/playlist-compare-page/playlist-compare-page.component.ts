import {Component} from '@angular/core';
import {ActivatedRoute, Navigation, Router} from '@angular/router';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import {Diff} from '@spotify/data';

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
  changesInOriginal: Diff[]= [];
  /**
   * Inject dependencies and start the compare process
   * @param router
   * @param {ApiService} apiService
   */
  constructor(private readonly router: Router, private apiService: ApiService) {
    const nav: Navigation | null = this.router.getCurrentNavigation();

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
      this.router.navigate(['/overview']);
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
    this.apiService.comparePlaylists(this.forkedPlaylistBasic?.id as string, this.originalPlaylistId as string, this.versionTimestamp).then(changesFork => {
      this.changesInFork = changesFork;
      return this.apiService.comparePlaylists(this.originalPlaylistId as string, this.originalPlaylistId as string, this.versionTimestamp)
    }).then(changesOriginal => {
      this.changesInOriginal = changesOriginal;
    })
  }
}
