import {EventEmitter, Injectable, Output} from '@angular/core';
import {environment} from '../../../environments/environment';
import {CustomError} from '../../types/CustomError';
import {SpotifyErrorService} from '../spotify-error/spotify-error.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthenticationService {
  private readonly CLIENT_ID = '0ad647aa391e490ba42610b5dde235b4';
  private readonly SCOPES = 'user-top-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
  private readonly REDIRECT_URI = environment.redirect_uri;
  @Output() errorEvent = new EventEmitter<CustomError>();

  constructor(private readonly errorHandler: SpotifyErrorService) {
  }

  async beginLogin(): Promise<string> {
    // https://tools.ietf.org/html/rfc7636#section-4.1
    const codeVerifier = this.base64url(this.randomBytes(96));
    const generatedState = this.base64url(this.randomBytes(96));

    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      response_type: 'code',
      redirect_uri: this.REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: await this.generateCodeChallenge(codeVerifier),
      state: generatedState,
      scope: this.SCOPES.replace(/\s/g, '%20')
    });

    sessionStorage.setItem('codeVerifier', codeVerifier);
    console.log('setting state');
    sessionStorage.setItem('state', generatedState);

    return `https://accounts.spotify.com/authorize?${params}`;
  }

  /**
   * https://tools.ietf.org/html/rfc7636#section-4.2
   * @param codeVerifier - Code verifier to use further with authentication
   */
  async generateCodeChallenge(codeVerifier): Promise<string> {
    const codeVerifierBytes = new TextEncoder().encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', codeVerifierBytes);
    return this.base64url(new Uint8Array(hashBuffer));
  }

  /**
   * @param size - Size of array to generate
   */
  randomBytes(size): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(size));
  }

  /**
   * @param bytes - Bytes to encode
   */
  base64url(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  isLoggedIn(): boolean {
    return (!!sessionStorage.getItem('tokenSet'));
  }

  async completeLogin(): Promise<void> {
    const codeVerifier = sessionStorage.getItem('codeVerifier');
    const state = sessionStorage.getItem('state');

    const params = new URLSearchParams(location.search);

    // if (params.has('error')) {
    //   throw new Error(params.get('error'));
    // } else if (!params.has('state')) {
    //   throw new Error('State missing from response');
    // } else if (params.get('state') !== state) {
    //   console.log('expected', state);
    //   console.log('got', params.get('state'));
    //   throw new Error('State mismatch');
    // } else if (!params.has('code')) {
    //   throw new Error('Code missing from response');
    // }

    await this.createAccessToken({
      grant_type: 'authorization_code',
      code: params.get('code'),
      redirect_uri: `${location.origin}/callback`,
      code_verifier: codeVerifier,
    });
  }

  /**
   * Fetches JSON from endpoint
   * @param input - URL to fetch from
   * @param init - options with request
   */
  async fetchJSON(input, init): Promise<any> {
    const response = await fetch(input, init);
    const body = await response.json();
    if (!response.ok) {
      throw this.errorHandler.handleError(body);
    }
    return body;
  }

  /**
   * @param params - Params to send with request
   * @returns - Promise with access token as string
   */
  async createAccessToken(params: Record<string, string>): Promise<string> {
    try {
      const response = await this.fetchJSON('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: this.CLIENT_ID,
          ...params,
        }),
      });

      const accessToken = response.access_token;
      const expiresAt = Date.now() + 1000 * response.expires_in;

      sessionStorage.setItem('tokenSet', JSON.stringify({...response, expires_at: expiresAt}));
      this.errorEvent.emit(undefined);
      return accessToken;
    } catch (e) {
      console.log('caught:', e);
      this.errorEvent.emit(e);
    }
  }

  /**
   * @returns Promise<string> - Contains the current tokenset if still valid
   */
  async getAccessToken(): Promise<string> {
    let tokenSet = JSON.parse(sessionStorage.getItem('tokenSet'));

    if (!tokenSet) {
      return;
    }

    if (tokenSet.expires_at < Date.now()) {
      tokenSet = await this.createAccessToken({
        grant_type: 'refresh_token',
        refresh_token: tokenSet.refresh_token,
      });
    }

    return tokenSet.access_token;
  }

  logOut(): void {
    sessionStorage.clear();
  }
}
