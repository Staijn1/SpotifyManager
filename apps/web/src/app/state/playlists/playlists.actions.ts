import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ForkCreation, PlaylistDetails, PlaylistSummary } from '../../core/playlist-api';

export const PlaylistActions = createActionGroup({
  source: 'Playlists',
  events: {
    Load: props<{ query: string }>(),
    Loaded: props<{ query: string; items: ReadonlyArray<PlaylistSummary> }>(),
    Failed: props<{ message: string }>(),
    'Load details': props<{ playlistId: string }>(),
    'Details loaded': props<{ details: PlaylistDetails }>(),
    'Details failed': props<{ message: string }>(),
    'Fork requested': props<{ playlistId: string; idempotencyKey: string }>(),
    'Fork succeeded': props<{ result: ForkCreation }>(),
    'Fork failed': props<{ message: string }>(),
    'Clear selected': emptyProps(),
  },
});
