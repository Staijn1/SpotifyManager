import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface ForkSummary {
  readonly id: string;
  readonly sourcePlaylistId: string;
  readonly externalPlaylistId: string | null;
  readonly provider: 'Spotify';
  readonly sourceName: string;
  readonly name: string;
  readonly status: 'pending' | 'active' | 'failed' | 'disconnected';
  readonly failureReason: string | null;
  readonly providerUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface ForkListResponse {
  readonly items: ReadonlyArray<ForkSummary>;
}

@Injectable({ providedIn: 'root' })
export class ForkApi {
  private readonly http = inject(HttpClient);

  load() {
    return this.http.get<ForkListResponse>('/api/v1/forks');
  }
}
