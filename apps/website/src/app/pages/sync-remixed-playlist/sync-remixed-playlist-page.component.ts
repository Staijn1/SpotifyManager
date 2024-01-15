import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation, Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Diff, PlaylistTrackObject } from '@spotify-manager/core';
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

  changes: Diff[] = [];
  syncedResult: Diff[] = [];
  isLoading = false;
  tracksInLeftPlaylist: PlaylistTrackObject[] = [];
  tracksInRightPlaylist: PlaylistTrackObject[] = [];

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

    this.apiService.getAllTracksInPlaylist(this.leftPlaylistId).then(tracks => {
      this.tracksInLeftPlaylist = this.sortTracks(tracks.items);
      return this.apiService.getAllTracksInPlaylist(this.rightPlaylistId);
    }).then(tracks => {
      this.tracksInRightPlaylist = this.sortTracks(tracks.items);
      return this.apiService.comparePlaylists(this.leftPlaylistId, this.rightPlaylistId);
    }).then(changes => {
      this.changes = changes;
      this.putUnchangedTracksInSyncedResult(changes);
    }).finally(() => this.isLoading = false);
  }

  /**
   * Automatically put all unchanged songs to the synced result, which is the list of songs that will make it to the synced playlist
   * @param changes
   * @private
   */
  private putUnchangedTracksInSyncedResult(changes: Diff[]) {
    const unchangedSongs = changes.filter(change => change[0] === 0);
    this.syncedResult = this.sortDiffsByTrackName(unchangedSongs);
  }

  private sortTracks(tracks: PlaylistTrackObject[]): PlaylistTrackObject[] {
    const copy = [...tracks];

    return copy.sort((a, b) => {
      return a.track.name.localeCompare(b.track.name);
    });
  }

  private sortDiffsByTrackName(diffs: Diff[]): Diff[] {
    // Extract PlaylistTrackObject from Diff
    const tracks = diffs.map(diff => diff[1]);

    // Sort tracks
    const sortedTracks = this.sortTracks(tracks);

    // Reassemble back into Diff
    const sortedDiffs = sortedTracks.map(track => [0, track] as Diff);

    return sortedDiffs;
  }
}
