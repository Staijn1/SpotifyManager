import {Controller, Get, Param} from '@nestjs/common';
import {PlaylistService} from '../../services/playlist/playlist.service';

@Controller('playlists')
export class PlaylistController {

  constructor(private readonly playlistService: PlaylistService) {
  }


  /**
   * Copy a playlist to a new playlist.
   */
  @Get('fork/:playlistid')
  public async forkPlaylist(@Param() params): Promise<SpotifyApi.CreatePlaylistResponse> {
    return this.playlistService.forkPlaylist(params.playlistid);
  }
}
