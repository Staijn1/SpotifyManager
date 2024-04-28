import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesService } from './user-preferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPreferencesEntity } from '../entities/user-preferences.entity';
import { repositoryMockFactory } from '../../../utilities/testing-utils';
import { SpotifyService } from '../../spotify/spotify.service';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        {
          provide: getRepositoryToken(UserPreferencesEntity),
          useValue: repositoryMockFactory
        },
        {
          provide: SpotifyService,
          useValue: jest.fn()
        }
      ]
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
