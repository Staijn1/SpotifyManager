import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Play the nextAudio element, pausing the current one if it is playing.
   * @param nextAudio
   */
  async playNextAudioAndPauseCurrentlyPlaying(nextAudio: HTMLAudioElement) {
    // If the next audio is the same as the current audio, do nothing.
    if (nextAudio === this.currentAudio) {
      return;
    }

    this.stopCurrentAudio();
    this.currentAudio = nextAudio;
    await this.currentAudio.play();
  }

  /**
   * Pause the current audio element.
   */
  stopCurrentAudio() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
  }
}
