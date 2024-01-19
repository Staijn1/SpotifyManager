import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyService } from './spotify.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

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
      ],
    }).compile();

    service = module.get<SpotifyService>(SpotifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
