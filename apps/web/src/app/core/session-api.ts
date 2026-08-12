import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface SessionUser {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
}

export interface SessionProviderConnection {
  readonly id: string;
  readonly provider: 'Spotify';
  readonly status: 'active' | 'expired' | 'restricted' | 'disconnected';
  readonly displayName: string;
  readonly scopes: ReadonlyArray<string>;
  readonly updatedAt: string;
}

export interface SessionResponse {
  readonly isAuthenticated: boolean;
  readonly spotifyConfigured: boolean;
  readonly user: SessionUser | null;
  readonly providerConnection: SessionProviderConnection | null;
}

@Injectable({ providedIn: 'root' })
export class SessionApi {
  private readonly http = inject(HttpClient);

  loadSession() {
    return this.http.get<SessionResponse>('/api/v1/auth/session');
  }

  logout() {
    return this.http.post<void>('/api/v1/auth/logout', null);
  }

  disconnectSpotify() {
    return this.http.delete<void>('/api/v1/provider-connections/spotify');
  }
}
