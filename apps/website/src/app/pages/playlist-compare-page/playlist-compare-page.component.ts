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
  difference: Diff[] = [];

  /**
   * Get the playlist id from the route, and get the tracks for both playlists from the API.
   * @param {ActivatedRoute} activatedRoute
   * @param {ApiService} apiService
   */
  constructor(private readonly activatedRoute: ActivatedRoute, private apiService: ApiService) {
    const leftPlaylistId = this.activatedRoute.snapshot.paramMap.get('playlistLeft');
    const rightPlaylistId = this.activatedRoute.snapshot.paramMap.get('playlistRight');

    if (!leftPlaylistId || !rightPlaylistId) {
      this.error = {message: 'There need to be two playlist ids provided.', code: 'NO_PLAYLIST_IDS'};
    }

    this.apiService.getAllTracksInPlaylist(leftPlaylistId as string).then(leftTracks => {
      this.leftTracks = leftTracks;
      this.leftTracksNames = leftTracks.items.map(track => track.track.name).sort();
      return this.apiService.getAllTracksInPlaylist(rightPlaylistId as string);
    }).then(rightTracks => {
      this.rightTracks = rightTracks;
      this.rightTracksNames = rightTracks.items.map(track => track.track.name).sort();
      this.calculateDiff();
    }).catch(error => {
      this.error = error;
    })
  }

  /**
   * Calculate the difference between the two playlists. Then generate the HTML for the diff.
   */
  calculateDiff(): void {
    const dmp = new DiffMatchPatch();
    this.difference = dmp.diff_main(this.leftTracksNames.join(','), this.rightTracksNames.join(','));
    this.html = dmp.diff_prettyHtml(this.difference)
  }
}
