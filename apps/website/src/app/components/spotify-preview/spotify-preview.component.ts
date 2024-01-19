import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  @Input() type = 'audio/mpeg';

  /**
   * Constructor
   * @param audioService
   */
  constructor(private audioService: AudioService) {}

  /**
   * Handle play event
   * @param event
   */
  handlePlay(event: Event) {
    const audioElement = event.target as HTMLAudioElement;
    this.audioService.playNext(audioElement).then();
  }
}
