import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferencesService } from '../services/user-preferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../../utilities/testing-utils';
import { UserPreferencesEntity } from '../entities/user-preferences.entity';

describe('UserPreferencesController', () => {
  let controller: UserPreferencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPreferencesController],
      providers: [
        { provide: UserPreferencesService, useValue: jest.fn() },
        {
          provide: getRepositoryToken(UserPreferencesEntity),
          useValue: repositoryMockFactory
        }
      ]
    }).compile();

    controller = module.get<UserPreferencesController>(
      UserPreferencesController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
