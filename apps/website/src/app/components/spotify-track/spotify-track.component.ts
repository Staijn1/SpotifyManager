import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ArtistObjectSimplified, EpisodeObjectFull, PlaylistTrackObject, TrackObjectFull } from '@spotify-manager/core';
import { NgClass } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-spotify-track',
  standalone: true,
  imports: [
    NgClass,
    FaIconComponent
  ],
  templateUrl: './spotify-track.component.html',
  styleUrl: './spotify-track.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SpotifyTrackComponent {
  @Input({
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
  @Input() isHorizontalLayout: boolean = false;
  @Input() ranking: number | undefined;
  @Input() imageClasses = 'w-full';
  @Input() reverse = false;
  @Input() showPreview = false;
  @ViewChild('audioElement') audioElement!: ElementRef;
  @ViewChild('progressBar') progressBar!: ElementRef;
  previewPlayIcon = faPlay;

  get previewUrl(): string | undefined {
    if (this.track?.type == 'track') {
      return this.track.preview_url;
    }

    return undefined;
  };

  get coverImage(): string {
    if (this.track?.type == 'track') {
      return this.track.album.images[1].url;
    }

    return this.track?.show.images[0].url ?? '';
  };

  get artists(): string {
    if (this.track?.type == 'track') {
      return this.track?.artists.map((artist: ArtistObjectSimplified) => artist.name).join(' | ') ?? '';
    }

    return 'Episodes not supported yet';
  };


  updatePreviewProgressBar() {
    const audio = this.audioElement.nativeElement;
    const progress = this.progressBar.nativeElement;
    progress.value = (audio.currentTime / audio.duration) * 100;
  }

  togglePreview() {
    const audio = this.audioElement.nativeElement;
    if (audio.paused) {
      audio.play();
      this.previewPlayIcon = faPause;
    } else {
      audio.pause();
      this.previewPlayIcon = faPlay;
    }
  }
}
