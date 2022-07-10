import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';

import {AppController} from './controllers/app.controller';
import {AppService} from './services/app.service';
import {PlaylistController} from './controllers/playlist-controller/playlist.controller';
import {SpotifyAuthenticationMiddleware} from './middleware/spotify-authentication.middleware';
import {SpotifyModule} from './spotify/spotify.module';

@Module({
  imports: [SpotifyModule],
  controllers: [AppController, PlaylistController],
  providers: [AppService, SpotifyAuthenticationMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SpotifyAuthenticationMiddleware)
      .forRoutes(PlaylistController);
  }
}
