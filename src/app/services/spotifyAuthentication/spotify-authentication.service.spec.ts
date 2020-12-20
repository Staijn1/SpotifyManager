import { TestBed } from '@angular/core/testing';

import { SpotifyAuthenticationService } from './spotify-authentication.service';

describe('SpotifyAuthenticationService', () => {
  let service: SpotifyAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
