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
}
