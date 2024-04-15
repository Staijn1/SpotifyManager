import { Module } from '@nestjs/common';
import { PlaylistController } from './controllers/playlist-controller/playlist.controller';
import { PlaylistService } from './services/playlist/playlist.service';
import { SpotifyModule } from '../spotify/spotify.module';
import { UtilModule } from '../util/util.module';

@Module({
  imports: [SpotifyModule, UtilModule],
  controllers: [PlaylistController],
  providers: [PlaylistService]
})
export class PlaylistModule {
}
