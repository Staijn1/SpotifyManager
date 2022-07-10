import { SpotifyAuthenticationMiddleware } from './spotify-authentication.middleware';

describe('SpotifyAuthenticationMiddleware', () => {
  it('should be defined', () => {
    expect(new SpotifyAuthenticationMiddleware()).toBeDefined();
  });
});
