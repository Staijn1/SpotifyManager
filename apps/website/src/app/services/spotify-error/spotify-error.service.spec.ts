import { TestBed } from '@angular/core/testing';

import { SpotifyErrorService } from './spotify-error.service';

describe('SpotifyErrorService', () => {
  let service: SpotifyErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
