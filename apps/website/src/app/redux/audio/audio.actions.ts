import { createAction, props } from '@ngrx/store';

export const playAudio = createAction(
  '[Audio] Play Audio',
  props<{ audio: HTMLAudioElement }>()
);

export const pauseAudio = createAction('[Audio] Pause Audio');
