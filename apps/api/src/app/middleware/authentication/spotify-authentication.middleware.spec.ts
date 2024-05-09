import {SpotifyAuthenticationMiddleware} from './spotify-authentication.middleware';
import {SpotifyService} from '../../modules/spotify/spotify/spotify.service';

describe('SpotifyAuthenticationMiddleware', () => {
  let sut: SpotifyAuthenticationMiddleware;
  let spotifyService: SpotifyService;

  beforeEach(() => {
    spotifyService = {
      setAccessToken: jest.fn(),
    } as any;

    sut = new SpotifyAuthenticationMiddleware(spotifyService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });
});
