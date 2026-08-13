import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ForkSummary } from '../../core/fork-api';
import { AppState } from '../../state/app.state';
import { ForkActions } from '../../state/forks/forks.actions';

@Component({
  selector: 'app-fork-detail-page',
  imports: [RouterLink],
  templateUrl: './fork-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkDetailPage {
  private readonly store = inject(Store<AppState>);
  private loadedKey = '';

  readonly forkId = input('');
  protected readonly providerState = this.store.selectSignal((state) => state.providerConnections);
  protected readonly forksState = this.store.selectSignal((state) => state.forks);
  protected readonly fork = computed(() =>
    this.forksState().items.find((item: ForkSummary) => item.id === this.forkId()),
  );

  private readonly loadWhenConnected = effect(() => {
    const connection = this.providerState().connections[0];
    const forkId = this.forkId();
    const key = connection?.status === 'active' ? `${connection.id}:${forkId}` : '';
    if (forkId && key && key !== this.loadedKey) {
      this.loadedKey = key;
      this.store.dispatch(ForkActions.load());
      this.store.dispatch(ForkActions.loadChanges({ forkId }));
    }
  });

  protected refresh(): void {
    const forkId = this.forkId();
    if (forkId && !this.forksState().refreshing) {
      this.store.dispatch(ForkActions.refresh({ forkId }));
    }
  }
}
