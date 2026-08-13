import { ForkActions } from './forks.actions';
import { forksReducer } from './forks.reducer';

describe('forksReducer', () => {
  it('stores review proposals and a refresh result', () => {
    const loading = forksReducer(
      undefined,
      ForkActions.loadChanges({ forkId: 'fork-id' }),
    );
    const loaded = forksReducer(
      loading,
      ForkActions.changesLoaded({
        forkId: 'fork-id',
        items: [
          {
            id: 'change-id',
            type: 'added',
            occurrenceKey: 'track#1',
            title: 'Track',
            artists: ['Artist'],
            availability: 'available',
            fromPosition: null,
            toPosition: 0,
            reviewStatus: 'proposed',
            createdAt: '2026-08-13T10:00:00Z',
          },
        ],
      }),
    );
    const refreshed = forksReducer(
      loaded,
      ForkActions.refreshed({
        result: {
          forkId: 'fork-id',
          sourceChanged: true,
          proposedChangeCount: 1,
          checkedAt: '2026-08-13T10:00:00Z',
        },
      }),
    );

    expect(refreshed.changes).toHaveLength(1);
    expect(refreshed.refreshResult?.sourceChanged).toBe(true);
    expect(refreshed.refreshing).toBe(false);
  });
});
