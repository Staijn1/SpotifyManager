import { Module } from '@nestjs/common';
import { PlaylistController } from './controllers/playlist-controller/playlist.controller';
import { PlaylistService } from './services/playlist/playlist.service';
import { SpotifyModule } from '../spotify/spotify.module';
import { PlaylistHistoryService } from './services/playlist-history/playlist-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistRemixEntity } from './entities/playlist-remix.entity';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';

@Module({
  imports: [SpotifyModule, TypeOrmModule.forFeature([PlaylistRemixEntity]), UserPreferencesModule],
  controllers: [PlaylistController],
  providers: [PlaylistService, PlaylistHistoryService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
