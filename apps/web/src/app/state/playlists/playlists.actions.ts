import { createActionGroup, props } from '@ngrx/store';
import { PlaylistSummary } from '../../core/playlist-api';

export const PlaylistActions = createActionGroup({
  source: 'Playlists',
  events: {
    Load: props<{ query: string }>(),
    Loaded: props<{ query: string; items: ReadonlyArray<PlaylistSummary> }>(),
    Failed: props<{ message: string }>(),
  },
});
