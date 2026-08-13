import { PlaylistActions } from './playlists.actions';
import { playlistsReducer } from './playlists.reducer';

describe('playlistsReducer', () => {
  it('tracks playlist inspection and a successful fork', () => {
    const loading = playlistsReducer(
      undefined,
      PlaylistActions.loadDetails({ playlistId: 'source' }),
    );
    expect(loading.selectedLoading).toBe(true);

    const inspected = playlistsReducer(
      loading,
      PlaylistActions.detailsLoaded({
        details: {
          id: 'source',
          provider: 'Spotify',
          name: 'Source playlist',
          externalVersion: 'version-1',
          itemCount: 1,
          capturedAt: '2026-08-13T10:00:00Z',
          items: [
            {
              position: 0,
              occurrenceKey: 'track#1',
              trackId: 'track',
              title: 'Track',
              artists: ['Artist'],
              availability: 'available',
            },
          ],
        },
      }),
    );
    expect(inspected.selected?.name).toBe('Source playlist');

    const forking = playlistsReducer(
      inspected,
      PlaylistActions.forkRequested({ playlistId: 'source', idempotencyKey: 'request-1' }),
    );
    const created = playlistsReducer(
      forking,
      PlaylistActions.forkSucceeded({
        result: {
          id: 'fork-id',
          externalPlaylistId: 'spotify-fork-id',
          providerUrl: 'https://open.spotify.com/playlist/spotify-fork-id',
          name: 'Remix - Source playlist',
          status: 'active',
          wasExisting: false,
        },
      }),
    );

    expect(created.forking).toBe(false);
    expect(created.createdFork?.name).toBe('Remix - Source playlist');
  });
});
