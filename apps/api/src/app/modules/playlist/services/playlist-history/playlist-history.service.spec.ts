import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistHistoryService } from './playlist-history.service';

describe('PlaylistHistoryService', () => {
  let service: PlaylistHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistHistoryService],
    }).compile();

    service = module.get<PlaylistHistoryService>(PlaylistHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
