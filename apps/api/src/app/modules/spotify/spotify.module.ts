import {Module} from '@nestjs/common';
import {SpotifyService} from './spotify.service';
import {HttpModule} from '@nestjs/axios';

@Module({
  providers: [SpotifyService],
  imports: [HttpModule],
  exports: [SpotifyService],
})
export class SpotifyModule {
}
