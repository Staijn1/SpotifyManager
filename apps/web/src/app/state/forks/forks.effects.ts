import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';
import { ForkApi } from '../../core/fork-api';
import { ForkActions } from './forks.actions';

@Injectable()
export class ForksEffects {
  private readonly actions = inject(Actions);
  private readonly forkApi = inject(ForkApi);

  readonly load = createEffect(() =>
    this.actions.pipe(
      ofType(ForkActions.load),
      switchMap(() =>
        this.forkApi.load().pipe(
          map((response) => ForkActions.loaded({ items: response.items })),
          catchError(() => of(ForkActions.failed({ message: 'Could not load your remixes.' }))),
        ),
      ),
    ),
  );

  readonly loadChanges = createEffect(() =>
    this.actions.pipe(
      ofType(ForkActions.loadChanges),
      switchMap(({ forkId }) =>
        this.forkApi.loadChanges(forkId).pipe(
          map((response) => ForkActions.changesLoaded({ forkId, items: response.items })),
          catchError(() =>
            of(ForkActions.changesFailed({ message: 'Could not load source changes.' })),
          ),
        ),
      ),
    ),
  );

  readonly refresh = createEffect(() =>
    this.actions.pipe(
      ofType(ForkActions.refresh),
      exhaustMap(({ forkId }) =>
        this.forkApi.refresh(forkId).pipe(
          map((result) => ForkActions.refreshed({ result })),
          catchError(() =>
            of(ForkActions.refreshFailed({ message: 'Could not check the source playlist.' })),
          ),
        ),
      ),
    ),
  );

  readonly reloadAfterRefresh = createEffect(() =>
    this.actions.pipe(
      ofType(ForkActions.refreshed),
      map(({ result }) => ForkActions.loadChanges({ forkId: result.forkId })),
    ),
  );
}
