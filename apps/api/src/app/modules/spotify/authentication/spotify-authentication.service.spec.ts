import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyAuthenticationService } from './spotify-authentication.service';

describe('SpotifyAuthenticationService', () => {
  let service: SpotifyAuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpotifyAuthenticationService],
    }).compile();

    service = module.get<SpotifyAuthenticationService>(
      SpotifyAuthenticationService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
