import {Controller, Get} from '@nestjs/common';
import {PlaylistService} from '../../services/playlist/playlist.service';

@Controller('playlists')
export class PlaylistController {

  constructor(private readonly playlistService: PlaylistService) {
  }


  @Get('fork')
  public forkPlaylist(): string {
    return 'test'
  }
}
