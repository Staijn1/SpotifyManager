import {Controller, Get, Param} from '@nestjs/common';
import {PlaylistService} from '../../services/playlist/playlist.service';

@Controller('playlists')
export class PlaylistController {

  constructor(private readonly playlistService: PlaylistService) {
  }


  @Get('fork/:playlistid')
  public async forkPlaylist(@Param() params): Promise<string> {
    return this.playlistService.forkPlaylist(params.playlistid);
  }
}
