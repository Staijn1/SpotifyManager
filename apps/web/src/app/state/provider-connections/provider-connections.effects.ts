import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { SessionApi } from '../../core/session-api';
import { ProviderConnectionActions } from './provider-connections.actions';

@Injectable()
export class ProviderConnectionsEffects {
  private readonly actions = inject(Actions);
  private readonly sessionApi = inject(SessionApi);

  readonly disconnect = createEffect(() =>
    this.actions.pipe(
      ofType(ProviderConnectionActions.disconnectRequested),
      switchMap(() =>
        this.sessionApi.disconnectSpotify().pipe(
          map(() => ProviderConnectionActions.disconnected()),
          catchError(() =>
            of(
              ProviderConnectionActions.disconnectFailed({
                message: 'Could not disconnect Spotify.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
