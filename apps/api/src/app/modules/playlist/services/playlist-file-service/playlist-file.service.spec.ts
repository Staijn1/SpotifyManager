import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistFileService } from './playlist-file.service';

describe('PlaylistFileService', () => {
  let service: PlaylistFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistFileService],
    }).compile();

    service = module.get<PlaylistFileService>(PlaylistFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
