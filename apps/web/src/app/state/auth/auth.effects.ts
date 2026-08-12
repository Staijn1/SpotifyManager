import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, of, switchMap } from 'rxjs';
import { SessionApi } from '../../core/session-api';
import { ProviderConnectionActions } from '../provider-connections/provider-connections.actions';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions = inject(Actions);
  private readonly sessionApi = inject(SessionApi);

  readonly loadSession = createEffect(() =>
    this.actions.pipe(
      ofType(AuthActions.loadSession),
      switchMap(() =>
        this.sessionApi.loadSession().pipe(
          mergeMap((session) => [
            session.user
              ? AuthActions.sessionLoaded({
                  userId: session.user.id,
                  displayName: session.user.displayName,
                  email: session.user.email,
                })
              : AuthActions.sessionMissing(),
            ProviderConnectionActions.sessionStateLoaded({
              spotifyConfigured: session.spotifyConfigured,
              connection: session.providerConnection,
            }),
          ]),
          catchError(() =>
            of(AuthActions.sessionFailed({ message: 'Could not load your session.' })),
          ),
        ),
      ),
    ),
  );

  readonly logout = createEffect(() =>
    this.actions.pipe(
      ofType(AuthActions.logoutRequested),
      switchMap(() =>
        this.sessionApi.logout().pipe(
          switchMap(() => of(AuthActions.loadSession())),
          catchError(() =>
            of(AuthActions.sessionFailed({ message: 'Could not sign out.' })),
          ),
        ),
      ),
    ),
  );
}
