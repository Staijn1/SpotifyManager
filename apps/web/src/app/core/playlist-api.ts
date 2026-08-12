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
}
