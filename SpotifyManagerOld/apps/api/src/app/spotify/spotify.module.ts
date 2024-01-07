import {Module} from '@nestjs/common';
import {SpotifyService} from './spotify.service';
import {HttpModule} from '@nestjs/axios'
import {UtilModule} from '../modules/util/util.module';

@Module({
  providers: [SpotifyService],
  imports: [HttpModule, UtilModule],
  exports: [SpotifyService],
})
export class SpotifyModule {
}
