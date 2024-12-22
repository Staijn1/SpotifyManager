import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AudioFeaturesObject,
  PlaylistTrackObject,
  SinglePlaylistResponse,
  TrackObjectFull
} from '@spotify-manager/core';
import { ApiService } from '../../../services/api/api.service';
import { ActivatedRoute } from '@angular/router';
import { SpotifyTrackComponent } from '../../../components/spotify-track/spotify-track.component';

@Component({
  selector: 'app-dj-mode-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SpotifyTrackComponent],
  templateUrl: './dj-mode-details-page.component.html',
  styleUrls: ['./dj-mode-details-page.component.scss']
})
export class DjModeDetailsPageComponent implements OnInit {
  playlistId = '';
  protected sortedPlaylist: { track: TrackObjectFull, audioFeatures: AudioFeaturesObject, score: number }[] = [];
  protected currentPlaylist: SinglePlaylistResponse | undefined;
  protected songMovements: {
    track: PlaylistTrackObject | TrackObjectFull;
    positionsMoved: number;
    id: string;
    direction: "none" | "up" | "down"
  }[] = [];

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.playlistId = params.get('playlistId') || '';

      const promises = [
        this.apiService.getPlaylist(this.playlistId),
        this.apiService.djModePlaylist(this.playlistId)
      ];

      Promise.all(promises).then(([playlist, sortedPlaylist]) => {
        this.currentPlaylist = playlist as SinglePlaylistResponse;
        this.sortedPlaylist = sortedPlaylist as {
          track: TrackObjectFull,
          audioFeatures: AudioFeaturesObject,
          score: number
        }[];

        this.calculateMovements();
      });
    });
  }

  applySuggestedSorting(): void {
    this.apiService.applySorting(this.playlistId, this.sortedPlaylist.map(x => x.track.uri)).then(() => {
      console.log('Playlist reordered successfully');
    });
  }

  calculateMovements() {
    if (!this.currentPlaylist || !this.sortedPlaylist) {
      return;
    }

    this.songMovements = this.currentPlaylist.tracks.items.map((song, index) => {
      const sortedIndex = this.sortedPlaylist.findIndex((s) => s.track.id === song.track.id);
      const positionsMoved = index - sortedIndex;
      let direction: 'up' | 'down' | 'none' = 'none';

      if (positionsMoved > 0) {
        direction = 'up';
      } else if (positionsMoved < 0) {
        direction = 'down';
      }

      return {
        track: song.track as PlaylistTrackObject | TrackObjectFull,
        id: song.track.id,
        direction: direction,
        positionsMoved: Math.abs(positionsMoved)
      };
    });
  }
}
