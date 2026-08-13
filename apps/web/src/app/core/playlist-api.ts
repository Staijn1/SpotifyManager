import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface PlaylistSummary {
  readonly id: string;
  readonly provider: 'Spotify';
  readonly name: string;
  readonly description: string;
  readonly ownerDisplayName: string;
  readonly itemCount: number;
  readonly imageUrl: string | null;
  readonly providerUrl: string | null;
  readonly externalVersion: string | null;
  readonly isPublic: boolean | null;
  readonly isCollaborative: boolean;
  readonly canReadItems: boolean;
}

export type PlaylistItemAvailability = 'available' | 'unavailable' | 'local' | 'skipped';

export interface PlaylistItem {
  readonly position: number;
  readonly occurrenceKey: string;
  readonly trackId: string | null;
  readonly title: string;
  readonly artists: ReadonlyArray<string>;
  readonly availability: PlaylistItemAvailability;
}

export interface PlaylistDetails {
  readonly id: string;
  readonly provider: 'Spotify';
  readonly name: string;
  readonly externalVersion: string | null;
  readonly itemCount: number;
  readonly capturedAt: string;
  readonly items: ReadonlyArray<PlaylistItem>;
}

export interface ForkCreation {
  readonly id: string;
  readonly externalPlaylistId: string | null;
  readonly providerUrl: string | null;
  readonly name: string;
  readonly status: 'pending' | 'active' | 'failed' | 'disconnected';
  readonly wasExisting: boolean;
}

interface PlaylistListResponse {
  readonly items: ReadonlyArray<PlaylistSummary>;
}

@Injectable({ providedIn: 'root' })
export class PlaylistApi {
  private readonly http = inject(HttpClient);

  load(query = '') {
    const params = query.trim() ? new HttpParams().set('query', query.trim()) : undefined;
    return this.http.get<PlaylistListResponse>('/api/v1/playlists', { params });
  }

  get(playlistId: string) {
    return this.http.get<PlaylistDetails>(
      `/api/v1/playlists/${encodeURIComponent(playlistId)}`,
    );
  }

  fork(playlistId: string, idempotencyKey: string) {
    return this.http.post<ForkCreation>(
      `/api/v1/playlists/${encodeURIComponent(playlistId)}/forks`,
      { idempotencyKey },
    );
  }
}
