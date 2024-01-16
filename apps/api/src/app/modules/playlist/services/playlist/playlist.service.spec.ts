import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { SpotifyService } from '../../../spotify/spotify.service';
import { PlaylistFileService } from '../playlist-file-service/playlist-file.service';
import { buildMockPlaylistTrackResponse } from '../../../../utilities/testing-utils';

describe('PlaylistService', () => {
  let service: PlaylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistService,
        {
          provide: SpotifyService,
          useValue: {}
        },
        {
          provide: PlaylistFileService,
          useValue: {
            // mock methods here
          }
        }
      ]
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    expect(result.filter(v => v[0] == 0).length).toBe(3);
    expect(result.filter(v => v[0] == 1).length).toBe(0);
    expect(result.filter(v => v[0] == -1).length).toBe(1);
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

    expect(result.filter(v => v[0] == 0).length).toBe(3);
    expect(result.filter(v => v[0] == 1).length).toBe(1);
    expect(result.filter(v => v[0] == -1).length).toBe(0);
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


    expect(result.filter(v => v[0] == 0).length).toBe(3);
    expect(result.filter(v => v[0] != 0).length).toBe(0);
  });
});
