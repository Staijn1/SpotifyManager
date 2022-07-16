import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {PlaylistController} from './modules/playlist/controllers/playlist-controller/playlist.controller';
import {SpotifyAuthenticationMiddleware} from './middleware/authentication/spotify-authentication.middleware';
import {SpotifyModule} from './spotify/spotify.module';
import {PlaylistModule} from './modules/playlist/playlist.module';
import {LoggingMiddleware} from './middleware/logging/logging.middleware';

@Module({
  imports: [SpotifyModule, PlaylistModule],
  providers: [SpotifyAuthenticationMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SpotifyAuthenticationMiddleware)
      .forRoutes(PlaylistController);
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
