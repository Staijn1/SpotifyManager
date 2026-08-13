import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ChangeProposal, ForkSummary, RefreshForkResult } from '../../core/fork-api';

export const ForkActions = createActionGroup({
  source: 'Forks',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: ReadonlyArray<ForkSummary> }>(),
    Failed: props<{ message: string }>(),
    'Load changes': props<{ forkId: string }>(),
    'Changes loaded': props<{ forkId: string; items: ReadonlyArray<ChangeProposal> }>(),
    'Changes failed': props<{ message: string }>(),
    Refresh: props<{ forkId: string }>(),
    Refreshed: props<{ result: RefreshForkResult }>(),
    'Refresh failed': props<{ message: string }>(),
  },
});
