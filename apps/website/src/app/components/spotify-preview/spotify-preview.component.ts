import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AudioService } from '../../services/audio/audio.service';

@Component({
  selector: 'app-spotify-preview',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './spotify-preview.component.html',
  styleUrl: './spotify-preview.component.scss'
})
export class SpotifyPreviewComponent {
  @Input() previewUrl: string | undefined;
  @ViewChild('audioElement') audioElement!: ElementRef;
  @ViewChild('progressBar') progressBar!: ElementRef;
  protected previewPlayIcon = faPlay;

  constructor(private readonly audioService: AudioService) {
  }

  togglePreview() {
    const audio = this.audioElement.nativeElement;

    if (this.audioService.isPlaying) {
      this.audioService.pauseAudio();
      this.previewPlayIcon = faPlay;
    } else {
      this.audioService.playAudio(audio);
      this.previewPlayIcon = faPause;
    }
  }

  /**
   * Skip to a specific point in the preview when the user clicks on the progress bar.
   * @param event
   */
  skipPreview(event: MouseEvent) {
    const progressBar = this.progressBar.nativeElement;
    const audio = this.audioElement.nativeElement;
    const clickPositionInPixels = event.pageX - progressBar.getBoundingClientRect().left;
    const clickPositionInPercentage = (clickPositionInPixels / progressBar.offsetWidth) * 100;
    audio.currentTime = (clickPositionInPercentage / 100) * audio.duration;
  }

  /**
   * Update the progress bar when the preview is playing.
   * Maps the completion of the preview to the progress bar in a percentage between 0 and 100.
   */
  updatePreviewProgressBar() {
    const audio = this.audioElement.nativeElement;
    const progress = this.progressBar.nativeElement;
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
}
