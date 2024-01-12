import { EventEmitter, Injectable, Output } from '@angular/core';
import { HTTPService } from '../http/http-service.service';
import { Message } from '../../types/Message';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
import { MessageService } from '../message/message.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * Handles the authentication process with Spotify, using the Spotify Web API.
 * It follows the Authorization code with PKCE flow.
 * @see https://developer.spotify.com/documentation/general/guides/authorization-guide/
 */
@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthenticationService extends HTTPService {
  // The ID of the spotify application registered in the Spotify developer portal.
  private readonly CLIENT_ID = '0ad647aa391e490ba42610b5dde235b4';
  // Scopes is a space-separated list of scopes, found in the spotify API documentation.
  private readonly SCOPES = 'user-top-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
  /**
   * The redirect URI is the URL where the user will be redirected after the authentication process.
   * It must be registered in the Spotify developer portal.
   * The redirect URI is the current URL, with the last part replaced by 'callback'.
   * Example, current URL = 'https://some-subdomain.domain.nl/some-path/home' will become 'https://some-subdomain.domain.nl/some-path/callback'
   */
  private readonly REDIRECT_URI = window.location.href.replace(/\/[^/]*$/, '/callback');

  authCodeFlowConfig: AuthConfig = {
    loginUrl: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
    redirectUri: this.REDIRECT_URI,
    clientId: this.CLIENT_ID,
    responseType: 'code',
    scope: this.SCOPES,
    oidc: false,
    showDebugInformation: !environment.production,
  };

  @Output() errorEvent = new EventEmitter<Message>();

  constructor(private readonly oauthService: OAuthService, protected override readonly messageService: MessageService) {
    super(messageService);
    this.oauthService.configure(this.authCodeFlowConfig);
  }

  public initializeAuthorizitionFlow(): void {
    this.oauthService.initCodeFlow();
  }

  /**
   * Helper function to check if the user is authenticated.
   * @returns {boolean}
   */
  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  /**
   * Last step of the authentication process., by requesting an access token.
   * @returns {Promise<void>}
   */
  async completeLogin(): Promise<boolean> {
    return this.oauthService.tryLogin();
  }

  /**
   * Log out by clearing the session storage
   */
  logOut(): void {
    this.oauthService.logOut();
  }

  refreshAccessToken() {
    return this.oauthService.refreshToken();
  }

  canActivate() {
    return this.isLoggedIn();
  }
}
