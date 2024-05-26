import { Injectable } from '@nestjs/common';
import { PlaylistRemixEntity } from '../../entities/playlist-remix.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class PlaylistHistoryService {
  constructor(@InjectRepository(PlaylistRemixEntity) private readonly playlistRemixRepository: Repository<PlaylistRemixEntity>) {
  }

  /**
   * Get a playlist with a given ID at a given timestamp. If no timestamp is given, the last recorded playlist definition of the playlist with given id is returned.
   * @param remixedPlaylistId
   * @param userId
   */
  async getPlaylistDefinition(remixedPlaylistId: string, userId: string): Promise<PlaylistRemixEntity | null> {
    const query: FindOneOptions<PlaylistRemixEntity> = {
      where: {
        remixPlaylistId: remixedPlaylistId,
        userId: userId
      },
      order: { timestamp: 'DESC' }
    };

    return await this.playlistRemixRepository.findOne(query);
  }

  /**
   * Either adds a new playlist definition or updates an existing one.
   * @param remixEntity
   */
  async recordPlaylistDefinition(remixEntity: PlaylistRemixEntity) {
    // Check if a playlist definition already exists for this playlist
    const existingDefinition = await this.getPlaylistDefinition(remixEntity.remixPlaylistId, remixEntity.userId);

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

  async getPlaylistDefinitionsForUser(userid: string) {
    return await this.playlistRemixRepository.find({
      where: {
        userId: userid
      }
    });
  }
}
