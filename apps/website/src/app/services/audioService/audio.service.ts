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
  async playNextAudioAndPauseCurrentlyPlaying(audio: HTMLAudioElement) {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
    this.currentAudio = audio;
    await this.currentAudio.play();
  }

  /**
   * Pause the current audio element.
   */
  stopCurrentAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }
}
