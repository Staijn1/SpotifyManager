import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spotify-track',
  standalone: true,
  imports: [],
  templateUrl: './spotify-track.component.html',
  styleUrl: './spotify-track.component.scss'
})
export class SpotifyTrackComponent {
  @Input() track: SpotifyApi.TrackObjectFull | undefined;
  @Input() ranking: number | undefined;

  get artists(): string {
     return this.track?.artists.map((artist: SpotifyApi.ArtistObjectSimplified) => artist.name).join(', ') ?? '';
  };
}
