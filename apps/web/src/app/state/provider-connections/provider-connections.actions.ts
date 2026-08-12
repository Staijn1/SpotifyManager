import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SessionProviderConnection } from '../../core/session-api';

export const ProviderConnectionActions = createActionGroup({
  source: 'Provider connections',
  events: {
    'Session State Loaded': props<{
      spotifyConfigured: boolean;
      connection: SessionProviderConnection | null;
    }>(),
    'Disconnect Requested': emptyProps(),
    Disconnected: emptyProps(),
    'Disconnect Failed': props<{ message: string }>(),
  },
});
