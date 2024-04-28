import { TestBed } from '@angular/core/testing';

import { UserPreferenceService } from './user-preference.service';
import { MessageService } from '../message/message.service';
import { SpotifyAuthenticationService } from '../spotify-authentication/spotify-authentication.service';

describe('UserPreferenceService', () => {
  let service: UserPreferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MessageService,
          useValue: {
            setMessage: jest.fn(),
          }
        },
        {
          provide: SpotifyAuthenticationService,
          useValue: {
            getAccessToken: jest.fn()
          }
        }
      ]
    });
    service = TestBed.inject(UserPreferenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
