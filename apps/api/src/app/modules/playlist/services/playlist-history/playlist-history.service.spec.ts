import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistHistoryService } from './playlist-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlaylistRemixEntity } from '../../entities/playlist-remix.entity';
import { repositoryMockFactory } from '../../../../utilities/testing-utils';

describe('PlaylistHistoryService', () => {
  let service: PlaylistHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistHistoryService,
        {
          provide: getRepositoryToken(PlaylistRemixEntity),
          useValue: repositoryMockFactory
        }]
    }).compile();

    service = module.get<PlaylistHistoryService>(PlaylistHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
