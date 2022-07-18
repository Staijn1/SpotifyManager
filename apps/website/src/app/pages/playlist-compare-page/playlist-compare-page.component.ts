import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CustomError} from '../../types/CustomError';
import {ApiService} from '../../services/api/api.service';
import {Diff, diff_match_patch as DiffMatchPatch} from 'diff-match-patch';

@Component({
  selector: 'app-playlist-compare-page',
  templateUrl: './playlist-compare-page.component.html',
  styleUrls: ['./playlist-compare-page.component.scss'],
})
export class PlaylistComparePageComponent {
  error: CustomError | undefined;
  rightTracks!: SpotifyApi.PlaylistTrackResponse;
  rightTracksNames: string[] = [];
  leftTracks!: SpotifyApi.PlaylistTrackResponse;
  leftTracksNames: string[] = [];
  html!: string;
  differences: Diff[] = [];
  leftPlaylist!: SpotifyApi.SinglePlaylistResponse;
  rightPlaylist!: SpotifyApi.SinglePlaylistResponse;

  /**
   * Inject dependencies and start the compare process
   * @param {ActivatedRoute} activatedRoute
   * @param {ApiService} apiService
   * @param {SpotifyService} spotifyService
   */
  constructor(private readonly activatedRoute: ActivatedRoute, private apiService: ApiService) {
    this.getInformation().then(() => {
      this.differences = this.calculateDiff();
      // this.differences = this.transformDifference(this.differences);
    }).catch(error => this.error = error);
  }

  /**
   * Get the tracks for both playlists from the API.
   */
  async getInformation(): Promise<void> {
    const leftPlaylistId = this.activatedRoute.snapshot.paramMap.get('playlistLeft');
    const rightPlaylistId = this.activatedRoute.snapshot.paramMap.get('playlistRight');


    if (!leftPlaylistId || !rightPlaylistId) {
      this.error = {message: 'There need to be two playlist ids provided.', code: 'NO_PLAYLIST_IDS'};
    }
    const leftTracks = await this.apiService.getAllTracksInPlaylist(leftPlaylistId as string);
    this.leftPlaylist = await this.apiService.getPlaylist(leftPlaylistId as string);
    this.leftTracks = leftTracks;
    this.leftTracksNames = leftTracks.items.map(track => track.track.name + '<br>').sort();

    const rightTracks = await this.apiService.getAllTracksInPlaylist(rightPlaylistId as string);
    this.rightPlaylist = await this.apiService.getPlaylist(rightPlaylistId as string);
    this.rightTracks = rightTracks;
    this.rightTracksNames = rightTracks.items.map(track => track.track.name + '<br>').sort();
  }

  /**
   * Calculate the difference between the two playlists. Then generate the HTML for the diff.
   */
  calculateDiff(): Diff[] {
    const dmp = new DiffMatchPatch();
    return dmp.diff_main(this.rightTracksNames.join(''), this.leftTracksNames.join(''));
  }

  /**
   * Transform the diff into a list of differences for each song
   * todo better example
   * @param {Diff[]} differences
   * @returns {any[]}
   * @private
   */
  private transformDifference(differences: Diff[]): Diff[] {
    const newDifferences: Diff[] = [];
    for (const difference of differences) {
      const [type, text] = difference;
      const songs = text.split(',');
      for (const song of songs) {
        if (song !== '' && song !== ' ')
          newDifferences.push([type, song]);
      }
    }
    return newDifferences;
  }

  /**
   * Determine the css classes for the diff.
   * @param {[number, string]} diff
   * @returns {string}
   */
  determineCSSClass(diff: [number, string]): string {
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
}
