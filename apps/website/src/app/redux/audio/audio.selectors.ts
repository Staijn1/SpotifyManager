import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './audio.reducer';

export const selectAudioState = createFeatureSelector<State>('audio');

export const selectCurrentAudio = createSelector(
  selectAudioState,
  (state: State) => state.currentAudio
);

export const selectIsPlaying = createSelector(
  selectAudioState,
  (state: State) => state.isPlaying
);
