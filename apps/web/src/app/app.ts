import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from './state/app.state';
import { AuthActions } from './state/auth/auth.actions';
import { ProviderConnectionActions } from './state/provider-connections/provider-connections.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly store = inject(Store<AppState>);

  protected readonly navigationOpen = signal(false);
  protected readonly authState = this.store.selectSignal((state) => state.auth);
  protected readonly providerState = this.store.selectSignal((state) => state.providerConnections);
  protected readonly spotifyConnectionUrl = '/api/v1/auth/spotify/start?returnPath=/';

  constructor() {
    this.store.dispatch(AuthActions.loadSession());
  }

  protected closeNavigation(): void {
    this.navigationOpen.set(false);
  }

  protected disconnectSpotify(): void {
    this.store.dispatch(ProviderConnectionActions.disconnectRequested());
  }
}
