import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify/spotify.service';
import { HttpModule } from '@nestjs/axios';
import { SpotifyAuthenticationService } from './authentication/spotify-authentication.service';

@Module({
  providers: [SpotifyService, SpotifyAuthenticationService],
  imports: [HttpModule],
  exports: [SpotifyService, SpotifyAuthenticationService],
})
export class SpotifyModule {}
