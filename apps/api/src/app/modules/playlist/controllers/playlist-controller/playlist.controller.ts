import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlaylistService } from '../../services/playlist/playlist.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreatePlaylistResponse,
  Diff,
  ListOfUsersPlaylistsResponse,
  PlaylistTrackResponse,
  SinglePlaylistResponse,
  SyncPlaylistResult
} from '@spotify-manager/core';
import { CompareRemixedPlaylistRequest, PlaylistSyncRequest } from '../../../../RequestObjectsDecorated';

@ApiBearerAuth()
@ApiTags('playlists')
@Controller('playlists')
export class PlaylistController {
  /**
   * Inject dependencies
   * @param playlistService
   */
  constructor(private readonly playlistService: PlaylistService) {
  }

  /**
   * Copy a playlist to a new playlist.
   */
  @Get('remix/:playlistid')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the playlist to remix',
    schema: { oneOf: [{ type: 'string' }], example: '6vDGVr652ztNWKZuHvsFvx' }
  })
  public async remixPlaylist(
    @Param() params
  ): Promise<CreatePlaylistResponse> {
    return this.playlistService.remixPlaylist(params.playlistid);
  }

  /**
   * Get all songs of a playlist.
   */
  @Get(':playlistid/songs')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the playlist to get all the songs for',
    schema: { oneOf: [{ type: 'string' }], example: '6vDGVr652ztNWKZuHvsFvx' }
  })
  public async getAllSongsInPlaylist(
    @Param() params
  ): Promise<PlaylistTrackResponse> {
    return this.playlistService.getAllSongsInPlaylist(params.playlistid);
  }

  /**
   * Get all playlists of a user.
   */
  @Get()
  public async getAllPlaylistsOfUser(): Promise<ListOfUsersPlaylistsResponse> {
    return this.playlistService.getAllUserPlaylists();
  }

  /**
   * Get playlist details for one playlist
   * @param params
   */
  @Get(':playlistid')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the playlist to get all the songs for',
    schema: { oneOf: [{ type: 'string' }], example: '6vDGVr652ztNWKZuHvsFvx' }
  })
  public async getPlaylist(@Param() params: {playlistid: string}): Promise<SinglePlaylistResponse> {
    return this.playlistService.getPlaylist(params.playlistid);
  }

  /**
   * Compare a remixed playlist to the original and return the diff.
   * @param body
   */
  @Post('remix/compare')
  public async compare(@Body() body: CompareRemixedPlaylistRequest): Promise<Diff[]> {
    return this.playlistService.compareRemixedPlaylistWithOriginal(body.originalPlaylistId, body.remixedPlaylistId);
  }

  /**
   * Clear entire playlist and put given songs in it
   * @param body
   */
  @Post('remix/sync')
  public async syncRemixWithOriginal(
    @Body() body: PlaylistSyncRequest
  ): Promise<SyncPlaylistResult> {
    return this.playlistService.syncPlaylist(body.remixedPlaylistId, body.tracks);
  }
}
