import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferencesService } from '../services/user-preferences.service';

describe('UserPreferencesController', () => {
  let controller: UserPreferencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPreferencesController],
      providers: [
        { provide: UserPreferencesService, useValue: jest.fn() },
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
