import {Component} from '@angular/core';
import {ActivatedRoute, Navigation, Router} from '@angular/router';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import { Diff } from '@spotify/data';

@Component({
  selector: 'app-playlist-compare-page',
  templateUrl: './playlist-compare-page.component.html',
  styleUrls: ['./playlist-compare-page.component.scss'],
})
export class PlaylistComparePageComponent {
  error: CustomError | undefined;
  rightTracks!: SpotifyApi.PlaylistTrackObject[];
  leftTracks!: SpotifyApi.PlaylistTrackObject[];
  html!: string;
  changesLeft: Diff[] = [];
  changesRight: Diff[] = [];
  leftPlaylist!: SpotifyApi.SinglePlaylistResponse;
  rightPlaylist!: SpotifyApi.SinglePlaylistResponse;

  mergedTracks: SpotifyApi.PlaylistTrackObject[] = [];
  private forkedPlaylistBasic: SpotifyApi.PlaylistObjectSimplified | undefined;
  private originalPlaylistId: string | undefined;
  private versionTimestamp: number | undefined;

  /**
   * Inject dependencies and start the compare process
   * @param router
   * @param {ApiService} apiService
   */
  constructor(private readonly router: Router, private apiService: ApiService) {
    const nav: Navigation | null = this.router.getCurrentNavigation();

    if (!nav) return;

    if (nav.extras && nav.extras.state) {
      this.forkedPlaylistBasic = nav.extras.state['forkedPlaylist'];
      this.originalPlaylistId = nav.extras.state['originalPlaylistId'];
      this.versionTimestamp = nav.extras.state['versionTimestamp'];

      this.compareForkedPlaylistToOriginal();
    }

    /*this.getInformation().then(() => {
      this.changesLeft = this.calculateChanges(this.leftTracks, this.rightTracks);
      this.changesRight = this.calculateChanges(this.rightTracks, this.leftTracks);
      this.mergedTracks = this.changesLeft.filter(change => change[0] === 0).map(change => change[1]);
      // this.differences = this.transformDifference(this.differences);
    }).catch(error => this.error = error);*/
  }

  /*
    /!**
     * Get the tracks for both playlists from the API.
     *!/
    async getInformation(): Promise<void> {
      const leftPlaylistId = this.activatedRoute.snapshot.paramMap.get('playlistLeft');
      const rightPlaylistId = this.activatedRoute.snapshot.paramMap.get('playlistRight');


      if (!leftPlaylistId || !rightPlaylistId) {
        this.error = {message: 'There need to be two playlist ids provided.', code: 'NO_PLAYLIST_IDS'};
      }
      const leftTracks = await this.apiService.getAllTracksInPlaylist(leftPlaylistId as string);
      this.leftPlaylist = await this.apiService.getPlaylist(leftPlaylistId as string);
      this.leftTracks = leftTracks.items.sort()

      const rightTracks = await this.apiService.getAllTracksInPlaylist(rightPlaylistId as string);
      this.rightPlaylist = await this.apiService.getPlaylist(rightPlaylistId as string);
      this.rightTracks = rightTracks.items.sort();
    }

    /!**
     * Calculate the difference between the two playlists. Then generate the HTML for the diff.
     *!/
    calculateChanges(primary: SpotifyApi.PlaylistTrackObject[], secondary: SpotifyApi.PlaylistTrackObject[]): Diff[] {
      // Loop through the tracks of the primary playlist and compare them to the secondary playlist.
      // If the track is in the other playlist, add it to the diff with the type of 0.
      // If the track is not in the other playlist, add it to the diff with the type of 1.
      const changes: Diff[] = [];
      for (const primaryTrack of primary) {
        const secondaryTrack = secondary.find(track => track.track.id === primaryTrack.track.id);
        if (secondaryTrack) {
          changes.push([0, primaryTrack]);
        } else {
          changes.push([1, primaryTrack]);
        }
      }
      return changes;
    }
  */

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
    this.apiService.comparePlaylists(this.forkedPlaylistBasic?.id as string, this.originalPlaylistId as string, this.versionTimestamp).then(compareResult => {
      console.log(compareResult)
    })
  }
}
