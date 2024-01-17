import { createReducer, on } from '@ngrx/store';
import { playAudio, pauseAudio } from './audio.actions';

export interface State {
  currentAudio: HTMLAudioElement | null;
  isPlaying: boolean;
}

export const initialState: State = {
  currentAudio: null,
  isPlaying: false
};

export const audioReducer = createReducer(
  initialState,
  on(playAudio, (state, { audio }) => ({ currentAudio: audio, isPlaying: true })),
  on(pauseAudio, state => ({ ...state, isPlaying: false }))
);
