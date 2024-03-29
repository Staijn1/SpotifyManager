import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from '../../services/playlist/playlist.service';
import { PlaylistFileService } from '../../services/playlist-file-service/playlist-file.service';
import { SpotifyService } from '../../../spotify/spotify.service';

describe('PlaylistController', () => {
  let controller: PlaylistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistController],
      providers: [
        PlaylistService,
        {
          provide: PlaylistFileService,
          useValue: {
            // mock methods here
          },
        },
        {
          provide: SpotifyService,
          useValue: {
            // mock methods here
          },
        },
      ],
    }).compile();

    controller = module.get<PlaylistController>(PlaylistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
