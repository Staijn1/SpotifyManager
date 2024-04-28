import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from '../../services/playlist/playlist.service';
import { SpotifyService } from '../../../spotify/spotify.service';
import { PlaylistHistoryService } from '../../services/playlist-history/playlist-history.service';
import { MailService } from '../../../mail/mail.service';

describe('PlaylistController', () => {
  let controller: PlaylistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistController],
      providers: [
        PlaylistService,
        {
          provide: SpotifyService,
          useValue: {
            // mock methods here
          },
        },
        {
          provide: PlaylistHistoryService,
          useValue: {}
        },
        {
          provide: MailService,
          useValue: jest.fn()
        }
      ],
    }).compile();

    controller = module.get<PlaylistController>(PlaylistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
