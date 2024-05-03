import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SpotifyAuthenticationMiddleware } from './middleware/authentication/spotify-authentication.middleware';
import { PlaylistController } from './modules/playlist/controllers/playlist-controller/playlist.controller';
import { LoggingMiddleware } from './middleware/logging/logging.middleware';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { SpotifyModule } from './modules/spotify/spotify.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './typeorm/typeorm.service';
import { ConfigurationUtils } from './configuration/ConfigurationUtils';

@Module({
  imports: [
    SpotifyModule,
    PlaylistModule,
    ConfigModule.forRoot({
      load: [ConfigurationUtils.LoadConfiguration],
      isGlobal: true,
      cache: true,
      validate: ConfigurationUtils.ValidateConfiguration,
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),],
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
