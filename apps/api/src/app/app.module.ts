import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SpotifyAuthenticationMiddleware } from './middleware/authentication/spotify-authentication.middleware';
import { PlaylistController } from './modules/playlist/controllers/playlist-controller/playlist.controller';
import { LoggingMiddleware } from './middleware/logging/logging.middleware';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { SpotifyModule } from './modules/spotify/spotify.module';

@Module({
  imports: [SpotifyModule, PlaylistModule],
  providers: [SpotifyAuthenticationMiddleware],
})
export class AppModule implements NestModule {
  /**
   * Configure middlewares
   * @param consumer
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SpotifyAuthenticationMiddleware)
      .forRoutes(PlaylistController);
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
