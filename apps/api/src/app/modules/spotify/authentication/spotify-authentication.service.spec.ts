import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyAuthenticationService } from './spotify-authentication.service';
import { ConfigService } from '@nestjs/config';

describe('SpotifyAuthenticationService', () => {
  let service: SpotifyAuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpotifyAuthenticationService,{provide: ConfigService, useValue: jest.fn()}],
    }).compile();

    service = module.get<SpotifyAuthenticationService>(
      SpotifyAuthenticationService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
