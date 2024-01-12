import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistObjectSimplified } from '@spotify-manager/core';

@Component({
  selector: 'app-spotify-playlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spotify-playlist.component.html',
  styleUrl: './spotify-playlist.component.scss',
})
export class SpotifyPlaylistComponent {
  @Input() playlist: PlaylistObjectSimplified | undefined;
}
