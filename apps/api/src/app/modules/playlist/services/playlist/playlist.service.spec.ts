import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { SpotifyService } from '../../../spotify/spotify.service';
import { buildMockPlaylistTrackResponse, mockSong } from '../../../../utilities/testing-utils';
import { Diff, DiffIdentifier } from '@spotify-manager/core';

describe('PlaylistService', () => {
  let service: PlaylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistService,
        {
          provide: SpotifyService,
          useValue: {}
        }
      ]
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('should properly compare a remixed playlist with its original', async () => {
    const basePlaylistId = 'basePlaylistId';
    const remixedPlaylistId = 'remixedPlaylistId';

    const basePlaylistAtTimeOfRemix = buildMockPlaylistTrackResponse(['Song A', 'Song B', 'Song C', 'Song D', 'Song E']);
    const basePlaylistNow = buildMockPlaylistTrackResponse(['Song B', 'Song C', 'Song F', 'Song D', 'Song E']);
    const remixedPlaylistNow = buildMockPlaylistTrackResponse(['Song A', 'Song B', 'Song D', 'Song G', 'Song E']);

    jest.spyOn(service, 'getAllSongsInPlaylist')
      .mockResolvedValueOnce(basePlaylistAtTimeOfRemix)
      .mockResolvedValueOnce(basePlaylistNow)
      .mockResolvedValueOnce(remixedPlaylistNow);

    const result = await service.compareRemixedPlaylistWithOriginal(basePlaylistId, remixedPlaylistId);
    const expected: Diff[] = [
      [DiffIdentifier.REMOVED_IN_ORIGINAL, mockSong('Song A')],
      [DiffIdentifier.UNCHANGED, mockSong('Song B')],
      [DiffIdentifier.REMOVED_IN_REMIX, mockSong('Song C')],
      [DiffIdentifier.UNCHANGED, mockSong('Song D')],
      [DiffIdentifier.UNCHANGED, mockSong('Song E')],
      [DiffIdentifier.REMOVED_IN_ORIGINAL, mockSong('Song F')],
      [DiffIdentifier.ADDED_IN_REMIX, mockSong('Song G')]
    ];

    expect(result.length).toBe(expected.length);
    expect(result).toEqual(expected);
  });


  it('should detect a missing song in base playlist', async () => {
    const basePlaylistId = 'basePlaylistId';
    const otherPlaylistId = 'otherPlaylistId';
    const basePlaylistResponse = buildMockPlaylistTrackResponse(['song1', 'song2', 'song3']);
    const comparePlaylistResponse = buildMockPlaylistTrackResponse(['song1', 'song2', 'song3', 'song4']);

    jest.spyOn(service, 'getAllSongsInPlaylist')
      .mockResolvedValueOnce(basePlaylistResponse)
      .mockResolvedValueOnce(comparePlaylistResponse);

    const result = await service.comparePlaylist(basePlaylistId, otherPlaylistId);

    expect(service.getAllSongsInPlaylist).toHaveBeenCalledWith(basePlaylistId);
    expect(service.getAllSongsInPlaylist).toHaveBeenCalledWith(otherPlaylistId);
    expect(result).toBeTruthy();

    expect(result.filter(v => v[0] == DiffIdentifier.UNCHANGED).length).toBe(3);
    expect(result.filter(v => v[0] == DiffIdentifier.ADDED_IN_REMIX).length).toBe(1);
    expect(result.length).toBe(4);
  });

  it('should detect an added song in base playlist', async () => {
    const basePlaylistId = 'basePlaylistId';
    const otherPlaylistId = 'otherPlaylistId';
    const basePlaylistResponse = buildMockPlaylistTrackResponse(['song1', 'song2', 'song3', 'song4']);
    const comparePlaylistResponse = buildMockPlaylistTrackResponse(['song1', 'song2', 'song3']);

    jest.spyOn(service, 'getAllSongsInPlaylist')
      .mockResolvedValueOnce(basePlaylistResponse)
      .mockResolvedValueOnce(comparePlaylistResponse);

    const result = await service.comparePlaylist(basePlaylistId, otherPlaylistId);

    expect(service.getAllSongsInPlaylist).toHaveBeenCalledWith(basePlaylistId);
    expect(service.getAllSongsInPlaylist).toHaveBeenCalledWith(otherPlaylistId);
    expect(result).toBeTruthy();

    expect(result.filter(v => v[0] == DiffIdentifier.UNCHANGED).length).toBe(3);
    expect(result.filter(v => v[0] == DiffIdentifier.ADDED_IN_ORIGINAL).length).toBe(1);
    expect(result.length).toBe(4);
  });

  it('should not detect any changes for two identical playlists', async () => {
    const basePlaylistId = 'basePlaylistId';
    const otherPlaylistId = 'otherPlaylistId';
    const basePlaylistResponse = buildMockPlaylistTrackResponse(['song1', 'song2', 'song3']);
    const comparePlaylistResponse = buildMockPlaylistTrackResponse(['song1', 'song2', 'song3']);

    jest.spyOn(service, 'getAllSongsInPlaylist')
      .mockResolvedValueOnce(basePlaylistResponse)
      .mockResolvedValueOnce(comparePlaylistResponse);

    const result = await service.comparePlaylist(basePlaylistId, otherPlaylistId);

    expect(service.getAllSongsInPlaylist).toHaveBeenCalledWith(basePlaylistId);
    expect(service.getAllSongsInPlaylist).toHaveBeenCalledWith(otherPlaylistId);
    expect(result).toBeTruthy();


    expect(result.filter(v => v[0] == DiffIdentifier.UNCHANGED).length).toBe(3);
    expect(result.filter(v => v[0] != DiffIdentifier.UNCHANGED).length).toBe(0);
    expect(result.length).toBe(3);
  });
});
