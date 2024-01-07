import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistController } from './playlist.controller';
import {PlaylistService} from '../../services/playlist/playlist.service';

describe('PlaylistControllerController', () => {
  let controller: PlaylistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistController, PlaylistService],
    }).compile();

    controller = module.get<PlaylistController>(PlaylistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
