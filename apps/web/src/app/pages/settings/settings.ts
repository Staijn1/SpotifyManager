import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { AuthActions } from '../../state/auth/auth.actions';
import { ProviderConnectionActions } from '../../state/provider-connections/provider-connections.actions';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly store = inject(Store<AppState>);

  protected readonly authState = this.store.selectSignal((state) => state.auth);
  protected readonly providerState = this.store.selectSignal((state) => state.providerConnections);
  protected readonly spotifyConnectionUrl = '/api/v1/auth/spotify/start?returnPath=/settings';

  protected disconnectSpotify(): void {
    this.store.dispatch(ProviderConnectionActions.disconnectRequested());
  }

  protected logout(): void {
    this.store.dispatch(AuthActions.logoutRequested());
  }
}
