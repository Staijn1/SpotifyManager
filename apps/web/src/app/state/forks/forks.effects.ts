import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
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
}
