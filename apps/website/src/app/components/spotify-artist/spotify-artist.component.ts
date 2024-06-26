import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ArtistObjectFull, ImageObject } from '@spotify-manager/core';

@Component({
  selector: 'app-spotify-artist',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './spotify-artist.component.html',
  styleUrl: './spotify-artist.component.scss'
})
export class SpotifyArtistComponent {
  @Input() artist: ArtistObjectFull | undefined;
  @Input() ranking: number | undefined;

  get displayName(): string {
    const artistName = this.artist?.name ?? '';
    const prefix = this.ranking ? `${this.ranking}. ` : '';
    return `${prefix}${artistName}`;
  }

  /**
   * Returns the genres of the artist, by capitalizing the first letter of each genre and joining them with a |
   */
  get genres(): string {
    const genres = this.artist?.genres.map((genre: string) => genre.charAt(0).toUpperCase() + genre.slice(1)) ?? [];

    if (genres.length > 0) {
      return genres.join(' | ');
    }
    return 'Unknown';
  }

  get popularity(): number {
    return this.artist?.popularity ?? 0;
  }

  get image(): ImageObject | undefined {
    return this.artist?.images[1];
  }
}
