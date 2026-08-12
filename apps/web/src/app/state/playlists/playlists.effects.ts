import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { PlaylistApi } from '../../core/playlist-api';
import { ProviderConnectionActions } from '../provider-connections/provider-connections.actions';
import { PlaylistActions } from './playlists.actions';

@Injectable()
export class PlaylistsEffects {
  private readonly actions = inject(Actions);
  private readonly playlistApi = inject(PlaylistApi);

  readonly load = createEffect(() =>
    this.actions.pipe(
      ofType(PlaylistActions.load),
      switchMap(({ query }) =>
        this.playlistApi.load(query).pipe(
          map((response) => PlaylistActions.loaded({ query, items: response.items })),
          catchError(() =>
            of(PlaylistActions.failed({ message: 'Could not load Spotify playlists.' })),
          ),
        ),
      ),
    ),
  );

  readonly loadAfterConnection = createEffect(() =>
    this.actions.pipe(
      ofType(ProviderConnectionActions.sessionStateLoaded),
      filter(({ connection }) => connection?.status === 'active'),
      map(() => PlaylistActions.load({ query: '' })),
    ),
  );
}
