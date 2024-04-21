import { Module } from '@nestjs/common';
import { UserPreferencesController } from './controllers/user-preferences.controller';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserPreferencesEntity } from './entities/user-preferences.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotifyModule } from '../spotify/spotify.module';

@Module({
  controllers: [UserPreferencesController],
  imports: [
    SpotifyModule,
    TypeOrmModule.forFeature([UserPreferencesEntity]),
  ],
  providers: [UserPreferencesService],
})
export class UserPreferencesModule {}
