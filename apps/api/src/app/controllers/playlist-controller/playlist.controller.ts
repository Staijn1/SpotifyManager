import {Controller, Get} from '@nestjs/common';

@Controller('playlists')
export class PlaylistController {

  @Get('fork')
  public test(): string {
    return 'test'
  }
}
