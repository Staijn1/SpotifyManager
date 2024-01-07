import {Component, Input} from '@angular/core';
import {AudioService} from "../../services/audioService/audio.service";

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent {
  @Input() src: string | undefined;
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
    this.audioService.playNextAudioAndPauseCurrentlyPlaying(audioElement).then();
  }
}
