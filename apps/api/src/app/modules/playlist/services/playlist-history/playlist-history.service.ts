import { Injectable } from '@nestjs/common';

@Injectable()
export class PlaylistHistoryService {
  /**
   * Get a playlist with a given ID at a given timestamp. If no timestamp is given the last recorded playlist definition is returned.
   * @param originalPlaylistId
   * @param timestamp
   */
  async getPlaylistDefinition(originalPlaylistId: string, timestamp?: Date) {
  }

  /**
   * Either adds a new playlist definition or updates an existing one.
   * @param originalPlaylistId
   * @param playlistDefinition
   */
  async recordPlaylistDefinition(originalPlaylistId: string, playlistDefinition: any) {
    throw new Error('Method not implemented.')
  }
}
