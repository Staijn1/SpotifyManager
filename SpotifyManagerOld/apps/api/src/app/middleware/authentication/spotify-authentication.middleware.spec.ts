import {SpotifyAuthenticationMiddleware} from './spotify-authentication.middleware';
import {SpotifyService} from '../../spotify/spotify.service';

describe('SpotifyAuthenticationMiddleware', () => {
  const spotifyService = new SpotifyService()
  let sut;

  beforeEach(() => {
    sut = new SpotifyAuthenticationMiddleware(spotifyService)
  })
  it('should be defined', () => {
    expect(sut).toBeDefined();
  });
});
