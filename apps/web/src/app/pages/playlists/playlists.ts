import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { PlaylistActions } from '../../state/playlists/playlists.actions';

@Component({
  selector: 'app-playlists-page',
  imports: [RouterLink],
  templateUrl: './playlists.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistsPage {
  private readonly store = inject(Store<AppState>);

  protected readonly providerState = this.store.selectSignal((state) => state.providerConnections);
  protected readonly playlistsState = this.store.selectSignal((state) => state.playlists);
  protected readonly spotifyConnectionUrl = '/api/v1/auth/spotify/start?returnPath=/playlists';

  protected search(query: string): void {
    if (this.providerState().connections[0]?.status === 'active') {
      this.store.dispatch(PlaylistActions.load({ query }));
    }
  }
}
