import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { PlaylistItem } from '../../core/playlist-api';
import { AppState } from '../../state/app.state';
import { PlaylistActions } from '../../state/playlists/playlists.actions';

@Component({
  selector: 'app-playlist-detail-page',
  imports: [RouterLink],
  templateUrl: './playlist-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistDetailPage implements OnDestroy {
  private readonly store = inject(Store<AppState>);
  private loadedKey = '';
  private idempotencyKey: string | null = null;

  readonly playlistId = input('');
  protected readonly providerState = this.store.selectSignal((state) => state.providerConnections);
  protected readonly playlistState = this.store.selectSignal((state) => state.playlists);
  protected readonly skippedItemCount = computed(
    () =>
      this.playlistState().selected?.items.filter(
        (item: PlaylistItem) => item.availability !== 'available',
      )
        .length ?? 0,
  );

  private readonly loadWhenConnected = effect(() => {
    const playlistId = this.playlistId();
    const connection = this.providerState().connections[0];
    const key = connection?.status === 'active' ? `${connection.id}:${playlistId}` : '';

    if (playlistId && key && this.loadedKey !== key) {
      this.loadedKey = key;
      this.idempotencyKey = null;
      this.store.dispatch(PlaylistActions.loadDetails({ playlistId }));
    }
  });

  protected fork(): void {
    const playlistId = this.playlistId();
    if (!playlistId || this.playlistState().forking) {
      return;
    }

    this.idempotencyKey ??= crypto.randomUUID();
    this.store.dispatch(
      PlaylistActions.forkRequested({ playlistId, idempotencyKey: this.idempotencyKey }),
    );
  }

  protected connectionUrl(): string {
    return `/api/v1/auth/spotify/start?returnPath=${encodeURIComponent(`/playlists/${this.playlistId()}`)}`;
  }

  ngOnDestroy(): void {
    this.loadWhenConnected.destroy();
    this.store.dispatch(PlaylistActions.clearSelected());
  }
}
