import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Load Session': emptyProps(),
    'Session Loaded': props<{ userId: string; displayName: string }>(),
    'Session Missing': emptyProps(),
    'Session Failed': props<{ message: string }>(),
  },
});
