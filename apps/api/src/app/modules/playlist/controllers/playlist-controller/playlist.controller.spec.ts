import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from '../../services/playlist/playlist.service';

describe('PlaylistController', () => {
  let controller: PlaylistController;
  let playlistService: PlaylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistController],
      providers: [
        {
          provide: PlaylistService,
          useValue: {
            getDJModePlaylist: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlaylistController>(PlaylistController);
    playlistService = module.get<PlaylistService>(PlaylistService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
