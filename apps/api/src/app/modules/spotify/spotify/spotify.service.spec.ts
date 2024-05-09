import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyService } from './spotify.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { SpotifyAuthenticationService } from '../authentication/spotify-authentication.service';

describe('SpotifyService', () => {
  let service: SpotifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockImplementation(() => of({ data: {} })),
          },
        },
        {
          provide: SpotifyAuthenticationService,
          useValue: jest.fn()
        }
      ],
    }).compile();

    service = module.get<SpotifyService>(SpotifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
