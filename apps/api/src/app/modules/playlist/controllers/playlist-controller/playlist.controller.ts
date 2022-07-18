import {Controller, Get, Param} from '@nestjs/common';
import {PlaylistService} from '../../services/playlist/playlist.service';
import {ApiBearerAuth, ApiParam} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('playlists')
export class PlaylistController {
  /**
   * Inject dependencies
   * @param {PlaylistService} playlistService
   */
  constructor(private readonly playlistService: PlaylistService) {
  }


  /**
   * Copy a playlist to a new playlist.
   */
  @Get('fork/:playlistid')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the playlist to fork',
    schema: {oneOf: [{type: 'string'}], example: '6vDGVr652ztNWKZuHvsFvx'}
  })
  public async forkPlaylist(@Param() params): Promise<SpotifyApi.CreatePlaylistResponse> {
    return this.playlistService.forkPlaylist(params.playlistid);
  }

  /**
   * Get all songs of a playlist.
   */
  @Get(':playlistid/songs')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the playlist to get all the songs for',
    schema: {oneOf: [{type: 'string'}], example: '6vDGVr652ztNWKZuHvsFvx'}
  })
  public async getAllSongsInPlaylist(@Param() params): Promise<SpotifyApi.PlaylistTrackResponse> {
    return this.playlistService.getAllSongsInPlaylist(params.playlistid);
  }

  /**
   * Get all playlists of a user.
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  @Get()
  public async getAllPlaylistsOfUser(): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    return this.playlistService.getAllUserPlaylists();
  }

  /**
   * Get playlist details for one playlist
   * @param params
   * @returns {Promise<SpotifyApi.ListOfUsersPlaylistsResponse>}
   */
  @Get(':playlistid')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the playlist to get all the songs for',
    schema: {oneOf: [{type: 'string'}], example: '6vDGVr652ztNWKZuHvsFvx'}
  })
  public async getPlaylist(@Param() params): Promise<SpotifyApi.SinglePlaylistResponse> {
    return this.playlistService.getPlaylist(params.playlistid);
  }
}
