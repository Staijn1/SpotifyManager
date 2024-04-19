import { Injectable } from '@nestjs/common';
import { PlaylistRemixEntity } from '../../entities/playlist-remix.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { SinglePlaylistResponse } from '@spotify-manager/core';

@Injectable()
export class PlaylistHistoryService {
  constructor(@InjectRepository(PlaylistRemixEntity) private readonly playlistRemixRepository: Repository<PlaylistRemixEntity>) {
  }

  /**
   * Get a playlist with a given ID at a given timestamp. If no timestamp is given, the last recorded playlist definition of the playlist with given id is returned.
   * @param originalPlaylistId
   * @param remixedPlaylistId
   * @param userId
   * @param timestamp
   */
  async getPlaylistDefinition(originalPlaylistId: string, remixedPlaylistId: string, userId: string, timestamp?: Date) {
    const query: FindOneOptions<PlaylistRemixEntity> = {
      where: {
        originalPlaylistId: originalPlaylistId,
        remixPlaylistId: remixedPlaylistId,
        userId: userId,
        timestamp: timestamp !== undefined ? timestamp : undefined
      },
      order: timestamp ? undefined : { timestamp: 'DESC' }
    };

    return await this.playlistRemixRepository.findOne(query);
  }

  /**
   * Either adds a new playlist definition or updates an existing one.
   * @param remixEntity
   */
  async recordPlaylistDefinition(remixEntity: PlaylistRemixEntity) {
    // Check if a playlist definition already exists for this playlist
    const existingDefinition = await this.getPlaylistDefinition(remixEntity.originalPlaylistId, remixEntity.remixPlaylistId, remixEntity.userId, remixEntity.timestamp);

    if (existingDefinition) {
      // Update the existing playlist definition
      existingDefinition.timestamp = new Date();
      existingDefinition.originalPlaylistTrackIds = remixEntity.originalPlaylistTrackIds;
      return await this.playlistRemixRepository.save(existingDefinition);
    } else {
      // Create a new playlist definition
      return await this.playlistRemixRepository.save(remixEntity);
    }
  }
}
