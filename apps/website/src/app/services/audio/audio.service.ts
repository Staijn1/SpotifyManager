import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Play the new audio element, pausing the current one if it is playing.
   * @param nextAudio
   */
  async playNext(nextAudio: HTMLAudioElement) {
    if (nextAudio === this.currentAudio) return;


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

  /**
   * Check if the given url is the current audio element.
   * @param url
   */
  isSrcUrlCurrentlyPlaying(url: string): boolean {
    if (!this.currentAudio) return false;

    return this.currentAudio.src === url;
  }
}
