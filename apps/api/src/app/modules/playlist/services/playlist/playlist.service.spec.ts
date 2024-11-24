import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { SpotifyService } from '../../../spotify/spotify/spotify.service';
import { buildMockPlaylistTrackResponse, mockSong } from '../../../../utilities/testing-utils';
import { CurrentUsersProfileResponse, Diff, DiffIdentifier } from '@spotify-manager/core';
import { PlaylistHistoryService } from '../playlist-history/playlist-history.service';
import { ObjectId } from 'mongodb';
import { UserPreferencesService } from '../../../user-preferences/services/user-preferences.service';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let historyService: PlaylistHistoryService;
  let spotifyService: SpotifyService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistService,
        {
          provide: SpotifyService,
          useValue: {
            getCurrentUser: jest.fn(),
            getAudioFeaturesForTracks: jest.fn(),
            getAllSongsInPlaylist: jest.fn()
          }
        },
        {
          provide: PlaylistHistoryService,
          useValue: {
            getPlaylistDefinition: jest.fn()
          }
        },
        {
          provide: UserPreferencesService,
          useValue: jest.fn()
        }
      ]
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
    historyService = module.get<PlaylistHistoryService>(PlaylistHistoryService);
    spotifyService = module.get<SpotifyService>(SpotifyService);

    // Mock new Date() to always return the same date
    const mockDate = new Date('2021-01-01T00:00:00Z');
    global.Date = jest.fn(() => mockDate) as any;
    Date.now = jest.fn(() => mockDate.getTime());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should properly compare a remixed playlist with its original', async () => {
    const basePlaylistId = 'basePlaylistId';
    const remixedPlaylistId = 'remixedPlaylistId';

    const originalPlaylistNow = buildMockPlaylistTrackResponse(['Song B', 'Song C', 'Song F', 'Song D', 'Song E']);
    const originalPlaylistAtTimeOfLastSync = buildMockPlaylistTrackResponse(['Song A', 'Song B', 'Song C', 'Song D', 'Song E']);
    const remixedPlaylistNow = buildMockPlaylistTrackResponse(['Song A', 'Song B', 'Song D', 'Song G', 'Song E']);

    jest.spyOn(spotifyService, 'getAllSongsInPlaylist')
      .mockResolvedValueOnce(originalPlaylistNow)
      .mockResolvedValueOnce(remixedPlaylistNow);

    jest.spyOn(historyService, 'getPlaylistDefinition').mockResolvedValueOnce({
      id: new ObjectId("someObjectId"),
      originalPlaylistId: basePlaylistId,
      remixPlaylistId: remixedPlaylistId,
      timestamp: new Date(),
      userId: 'someUserId',
      originalPlaylistTrackIds: originalPlaylistAtTimeOfLastSync.items.map(track => track.track.id)
    });

    jest.spyOn(spotifyService, 'getCurrentUser').mockReturnValueOnce({ id: 'someUserId' } as CurrentUsersProfileResponse);

    const result = await service.compareRemixedPlaylistWithOriginal(basePlaylistId, remixedPlaylistId);
    const expected: Diff[] = [
      [DiffIdentifier.REMOVED_IN_ORIGINAL, mockSong('Song A')],
      [DiffIdentifier.UNCHANGED, mockSong('Song B')],
      [DiffIdentifier.REMOVED_IN_REMIX, mockSong('Song C')],
      [DiffIdentifier.UNCHANGED, mockSong('Song D')],
      [DiffIdentifier.UNCHANGED, mockSong('Song E')],
      [DiffIdentifier.ADDED_IN_ORIGINAL, mockSong('Song F')],
      [DiffIdentifier.ADDED_IN_REMIX, mockSong('Song G')]
    ];

    // sort result by song name
    result.sort((a, b) => a[1].track.name.localeCompare(b[1].track.name));
    expect(result).toEqual(expected);
  });

  it('should not detect any changes for two identical playlists', async () => {
    const basePlaylistId = 'basePlaylistId';
    const remixedPlaylistId = 'remixedPlaylistId';

    const originalPlaylistNow = buildMockPlaylistTrackResponse(['Song B', 'Song C', 'Song F', 'Song D', 'Song E']);
    const originalPlaylistAtTimeOfLastSync = buildMockPlaylistTrackResponse(['Song B', 'Song C', 'Song F', 'Song D', 'Song E']);
    const remixedPlaylistNow = buildMockPlaylistTrackResponse(['Song B', 'Song C', 'Song F', 'Song D', 'Song E']);

    jest.spyOn(spotifyService, 'getAllSongsInPlaylist')
      .mockResolvedValueOnce(originalPlaylistNow)
      .mockResolvedValueOnce(remixedPlaylistNow);

    jest.spyOn(historyService, 'getPlaylistDefinition').mockResolvedValueOnce({
      id: new ObjectId("someObjectId"),
      originalPlaylistId: basePlaylistId,
      remixPlaylistId: remixedPlaylistId,
      timestamp: new Date(),
      userId: 'someUserId',
      originalPlaylistTrackIds: originalPlaylistAtTimeOfLastSync.items.map(track => track.track.id)
    });

    jest.spyOn(spotifyService, 'getCurrentUser').mockReturnValueOnce({ id: 'someUserId' } as CurrentUsersProfileResponse);

    const result = await service.compareRemixedPlaylistWithOriginal(basePlaylistId, remixedPlaylistId);
    const expected: Diff[] = [
      [DiffIdentifier.UNCHANGED, mockSong('Song B')],
      [DiffIdentifier.UNCHANGED, mockSong('Song C')],
      [DiffIdentifier.UNCHANGED, mockSong('Song D')],
      [DiffIdentifier.UNCHANGED, mockSong('Song E')],
      [DiffIdentifier.UNCHANGED, mockSong('Song F')]
    ];

    // sort result by song name
    result.sort((a, b) => a[1].track.name.localeCompare(b[1].track.name));
    expect(result).toEqual(expected);
  });

  it('should detect a song as added in both, when it was added to the original AND added to the remix', async () => {
    const basePlaylistId = 'basePlaylistId';
    const remixedPlaylistId = 'remixedPlaylistId';

    const originalPlaylistNow = buildMockPlaylistTrackResponse(['Song A', 'Song B', 'Song C']);
    const originalPlaylistAtTimeOfLastSync = buildMockPlaylistTrackResponse(['Song A', 'Song B']);
    const remixedPlaylistNow = buildMockPlaylistTrackResponse(['Song A', 'Song B', 'Song C']);

    jest.spyOn(spotifyService, 'getAllSongsInPlaylist')
      .mockResolvedValueOnce(originalPlaylistNow)
      .mockResolvedValueOnce(remixedPlaylistNow);

    jest.spyOn(historyService, 'getPlaylistDefinition').mockResolvedValueOnce({
      id: new ObjectId("someObjectId"),
      originalPlaylistId: basePlaylistId,
      remixPlaylistId: remixedPlaylistId,
      timestamp: new Date(),
      userId: 'someUserId',
      originalPlaylistTrackIds: originalPlaylistAtTimeOfLastSync.items.map(track => track.track.id)
    });

    jest.spyOn(spotifyService, 'getCurrentUser').mockReturnValueOnce({ id: 'someUserId' } as CurrentUsersProfileResponse);

    const result = await service.compareRemixedPlaylistWithOriginal(basePlaylistId, remixedPlaylistId);
    const expected: Diff[] = [
      [DiffIdentifier.UNCHANGED, mockSong('Song A')],
      [DiffIdentifier.UNCHANGED, mockSong('Song B')],
      [DiffIdentifier.ADDED_IN_BOTH, mockSong('Song C')],
    ];

    // sort result by song name
    result.sort((a, b) => a[1].track.name.localeCompare(b[1].track.name));
    expect(result).toEqual(expected);
  });

  it('should not include tracks that are removed in both', async () => {
    const basePlaylistId = 'basePlaylistId';
    const remixedPlaylistId = 'remixedPlaylistId';

    const originalPlaylistNow = buildMockPlaylistTrackResponse(['Song A', 'Song B']);
    const originalPlaylistAtTimeOfLastSync = buildMockPlaylistTrackResponse(['Song A', 'Song B', 'Song C']);
    const remixedPlaylistNow = buildMockPlaylistTrackResponse(['Song A', 'Song B']);

    jest.spyOn(spotifyService, 'getAllSongsInPlaylist')
      .mockResolvedValueOnce(originalPlaylistNow)
      .mockResolvedValueOnce(remixedPlaylistNow);

    jest.spyOn(historyService, 'getPlaylistDefinition').mockResolvedValueOnce({
      id: new ObjectId("someObjectId"),
      originalPlaylistId: basePlaylistId,
      remixPlaylistId: remixedPlaylistId,
      timestamp: new Date(),
      userId: 'someUserId',
      originalPlaylistTrackIds: originalPlaylistAtTimeOfLastSync.items.map(track => track.track.id)
    });

    jest.spyOn(spotifyService, 'getCurrentUser').mockReturnValueOnce({ id: 'someUserId' } as CurrentUsersProfileResponse);

    const result = await service.compareRemixedPlaylistWithOriginal(basePlaylistId, remixedPlaylistId);
    const expected: Diff[] = [
      [DiffIdentifier.UNCHANGED, mockSong('Song A')],
      [DiffIdentifier.UNCHANGED, mockSong('Song B')],
    ];

    // sort result by song name
    // result.sort((a, b) => a[1].track.name.localeCompare(b[1].track.name));
    expect(result).toEqual(expected);
  });
});
