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
   * @param timestamp
   */
  async getPlaylistDefinition(originalPlaylistId: string, timestamp?: Date) {
    const query: FindOneOptions<PlaylistRemixEntity> = {
      where: {
        originalPlaylistId: originalPlaylistId,
        timestamp: timestamp ? timestamp : undefined
      },
      order: timestamp ? undefined : { timestamp: 'DESC' }
    };

    return await this.playlistRemixRepository.findOne(query);
  }

  /**
   * Either adds a new playlist definition or updates an existing one.
   * @param originalPlaylistDefinition
   * @param remixPlaylistId
   */
  async recordPlaylistDefinition(originalPlaylistDefinition: SinglePlaylistResponse, remixPlaylistId: string) {
    const playlistRemixEntity = new PlaylistRemixEntity();
    playlistRemixEntity.originalPlaylistId = originalPlaylistDefinition.id;
    playlistRemixEntity.remixPlaylistId = remixPlaylistId;
    playlistRemixEntity.timestamp = new Date();
    playlistRemixEntity.originalPlaylistTrackIds = originalPlaylistDefinition.tracks.items.map(track => track.track.id);

    return await this.playlistRemixRepository.save(playlistRemixEntity);
  }
}
