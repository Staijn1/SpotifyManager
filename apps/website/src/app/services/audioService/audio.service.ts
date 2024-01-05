import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Play the audio element, pausing the current one if it is playing.
   * @param audio
   */
  async play(audio: HTMLAudioElement) {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
    this.currentAudio = audio;
    await this.currentAudio.play();
  }
}
