import {Controller, Get, Param} from '@nestjs/common';
import {PlaylistService} from '../../services/playlist/playlist.service';
import {ApiBearerAuth, ApiParam} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('playlists')
export class PlaylistController {

  constructor(private readonly playlistService: PlaylistService) {
  }


  /**
   * Copy a playlist to a new playlist.
   */
  @Get('fork/:playlistid')
  @ApiParam({name: 'playlistid', required: true, description: 'The ID of the playlist to fork', schema: { oneOf: [{type: 'string'}], example: '6vDGVr652ztNWKZuHvsFvx'}})
  public async forkPlaylist(@Param() params): Promise<SpotifyApi.CreatePlaylistResponse> {
    return this.playlistService.forkPlaylist(params.playlistid);
  }

  /**
   * Get all songs of a playlist.
   */
  @Get(':playlistid')
  @ApiParam({name: 'playlistid', required: true, description: 'The ID of the playlist to get all the songs for', schema: { oneOf: [{type: 'string'}], example: '6vDGVr652ztNWKZuHvsFvx'}})
  public async getAllSongsInPlaylist(@Param() params): Promise<SpotifyApi.PlaylistTrackResponse> {
    return this.playlistService.getAllSongsInPlaylist(params.playlistid);
  }
}
