import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { SpotifyService } from '../../../spotify/spotify.service';
import { PlaylistFileService } from '../playlist-file-service/playlist-file.service';

describe('PlaylistService', () => {
  let service: PlaylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistService,
        {
          provide: SpotifyService,
          useValue: {
            // mock methods here
          },
        },
        {
          provide: PlaylistFileService,
          useValue: {
            // mock methods here
          },
        },
      ],
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
