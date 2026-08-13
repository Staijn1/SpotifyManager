import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ForkSummary } from '../../core/fork-api';

export const ForkActions = createActionGroup({
  source: 'Forks',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: ReadonlyArray<ForkSummary> }>(),
    Failed: props<{ message: string }>(),
  },
});
