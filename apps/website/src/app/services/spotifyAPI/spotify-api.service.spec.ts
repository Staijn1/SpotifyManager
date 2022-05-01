import { TestBed } from '@angular/core/testing';

import { SpotifyAPIService } from './spotify-api.service';

describe('SpotifyAPIService', () => {
  let service: SpotifyAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
