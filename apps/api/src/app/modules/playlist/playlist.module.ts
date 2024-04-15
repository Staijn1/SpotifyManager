import { Module } from '@nestjs/common';
import { PlaylistController } from './controllers/playlist-controller/playlist.controller';
import { PlaylistService } from './services/playlist/playlist.service';
import { SpotifyModule } from '../spotify/spotify.module';
import { PlaylistHistoryService } from './services/playlist-history/playlist-history.service';

@Module({
  imports: [SpotifyModule],
  controllers: [PlaylistController],
  providers: [PlaylistService, PlaylistHistoryService],
})
export class PlaylistModule {}
