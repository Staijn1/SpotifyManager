import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private currentAudio: HTMLAudioElement | null = null;

  get isPlaying(): boolean {
    if (!this.currentAudio) return false;

    return !this.currentAudio.paused;
  }

  async playAudio(newAudio: HTMLAudioElement) {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    this.currentAudio = newAudio;
    await this.currentAudio.play();
  }

  pauseAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }
}
