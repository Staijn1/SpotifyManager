import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ArtistObjectSimplified, EpisodeObjectFull, PlaylistTrackObject, TrackObjectFull } from '@spotify-manager/core';
import { NgClass } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SpotifyPreviewComponent } from '../spotify-preview/spotify-preview.component';

@Component({
  selector: 'app-spotify-track',
  standalone: true,
  imports: [
    NgClass,
    FaIconComponent,
    SpotifyPreviewComponent
  ],
  templateUrl: './spotify-track.component.html',
  styleUrl: './spotify-track.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SpotifyTrackComponent {
  @Input({
    // The playlist track object has a track property that is a TrackObjectFull
    // So we transform the PlaylistTrackObject to a TrackObjectFull for better compatibility
    transform: (value: PlaylistTrackObject | TrackObjectFull | undefined) => {
      if (!value) return value;

      // False positive
      // eslint-disable-next-line
      if ('track' in value) {
        return value.track;
      }
      return value;
    }
  }) track: TrackObjectFull | EpisodeObjectFull | undefined;
  @Input() isHorizontalLayout = false;
  @Input() ranking: number | undefined;
  @Input() imageClasses = 'w-full';
  @Input() reverse = false;
  @Input() showPreview = false;

  get previewUrl(): string | undefined {
    switch (this.track?.type) {
      case 'track':
        return this.track.preview_url;
      case 'episode':
        return this.track.audio_preview_url ?? undefined;
      default:
        return undefined;
    }
  }

  get coverImage(): string {
    if (!this.track) return '';
    switch (this.track.type) {
      case 'track':
        return this.track.album.images[1].url;
      case 'episode':
        return this.track.album.images[0].url ?? '';
      default:
        return '';
    }
  }

  get artists(): string {
    if (this.track?.type == 'track') {
      return this.track?.artists.map((artist: ArtistObjectSimplified) => artist.name).join(' | ') ?? '';
    }

    return 'Episodes not supported yet';
  }
}
