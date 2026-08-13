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
  readonly proposedChangeCount: number;
  readonly failureReason: string | null;
  readonly providerUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface ForkListResponse {
  readonly items: ReadonlyArray<ForkSummary>;
}

export interface ChangeProposal {
  readonly id: string;
  readonly type: 'added' | 'removed' | 'reordered' | 'unavailable' | 'local' | 'skipped';
  readonly occurrenceKey: string;
  readonly title: string;
  readonly artists: ReadonlyArray<string>;
  readonly availability: string;
  readonly fromPosition: number | null;
  readonly toPosition: number | null;
  readonly reviewStatus: string;
  readonly createdAt: string;
}

interface ChangeListResponse {
  readonly items: ReadonlyArray<ChangeProposal>;
}

export interface RefreshForkResult {
  readonly forkId: string;
  readonly sourceChanged: boolean;
  readonly proposedChangeCount: number;
  readonly checkedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ForkApi {
  private readonly http = inject(HttpClient);

  load() {
    return this.http.get<ForkListResponse>('/api/v1/forks');
  }

  loadChanges(forkId: string) {
    return this.http.get<ChangeListResponse>(
      `/api/v1/forks/${encodeURIComponent(forkId)}/changes`,
    );
  }

  refresh(forkId: string) {
    return this.http.post<RefreshForkResult>(
      `/api/v1/forks/${encodeURIComponent(forkId)}/refresh`,
      {},
    );
  }
}
