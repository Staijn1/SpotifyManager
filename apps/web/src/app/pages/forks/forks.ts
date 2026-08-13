import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { ForkActions } from '../../state/forks/forks.actions';

@Component({
  selector: 'app-forks-page',
  imports: [RouterLink],
  templateUrl: './forks.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForksPage {
  private readonly store = inject(Store<AppState>);
  private loadedForConnection = '';

  protected readonly providerState = this.store.selectSignal((state) => state.providerConnections);
  protected readonly forksState = this.store.selectSignal((state) => state.forks);

  private readonly loadWhenConnected = effect(() => {
    const connection = this.providerState().connections[0];
    if (connection?.status === 'active' && connection.id !== this.loadedForConnection) {
      this.loadedForConnection = connection.id;
      this.store.dispatch(ForkActions.load());
    }
  });
}
