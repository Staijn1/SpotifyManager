import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-spotify-artist',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './spotify-artist.component.html',
  styleUrl: './spotify-artist.component.scss'
})
export class SpotifyArtistComponent {
  @Input() artist: SpotifyApi.ArtistObjectFull | undefined;
  @Input() ranking: number | undefined;

  get displayName(): string {
    const artistName = this.artist?.name ?? '';
    const prefix = this.ranking ? `${this.ranking}. ` : '';
    return `${prefix}${artistName}`;
  };

  /**
   * Returns the genres of the artist, by capitalizing the first letter of each genre and joining them with a |
   */
  get genres(): string {
    const genres = this.artist?.genres.map((genre: string) => genre.charAt(0).toUpperCase() + genre.slice(1));
    return genres?.join(' | ') ?? '';
  }

  get popularity(): number {
    return this.artist?.popularity ?? 0;
  }

  get image(): SpotifyApi.ImageObject | undefined {
    return this.artist?.images[1];
  }
}
