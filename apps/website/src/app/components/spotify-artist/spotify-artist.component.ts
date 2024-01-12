import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spotify-artist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spotify-artist.component.html',
  styleUrl: './spotify-artist.component.scss'
})
export class SpotifyArtistComponent {
  @Input() artist: SpotifyApi.ArtistObjectFull | undefined;
  @Input() ranking: number | undefined;
}
