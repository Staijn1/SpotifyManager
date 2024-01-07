import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import {SpotifyService} from '../../../../spotify/spotify.service';

describe('PlaylistService', () => {
  let service: PlaylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistService, SpotifyService],
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
