import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlaylistService } from '../../services/playlist/playlist.service';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import {
  CreatePlaylistResponse,
  Diff,
  ListOfUsersPlaylistsResponse,
  PlaylistCompareRequest,
  PlaylistSyncRequest,
  PlaylistTrackResponse,
  RemixedPlaylistInformation,
  SinglePlaylistResponse, SyncPlaylistResult
} from '@spotify-manager/core';

@ApiBearerAuth()
@Controller('playlists')
export class PlaylistController {
  /**
   * Inject dependencies
   * @param playlistService
   */
  constructor(private readonly playlistService: PlaylistService) {}

  /**
   * Copy a playlist to a new playlist.
   */
  @Get('remix/:playlistid')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the playlist to remix',
    schema: { oneOf: [{ type: 'string' }], example: '6vDGVr652ztNWKZuHvsFvx' },
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
    schema: { oneOf: [{ type: 'string' }], example: '6vDGVr652ztNWKZuHvsFvx' },
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
    schema: { oneOf: [{ type: 'string' }], example: '6vDGVr652ztNWKZuHvsFvx' },
  })
  public async getPlaylist(
    @Param() params
  ): Promise<SinglePlaylistResponse> {
    return this.playlistService.getPlaylist(params.playlistid);
  }

  /**
   * Get the different versions available for the original playlist. These versions are created when the original playlists gets copied more than once
   * Each time a version is created, the user will have to choose which version to compare the remix playlist with when syncing.
   * @param params
   */
  @Get('remixes/:playlistid/versions')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the original playlist',
    schema: { oneOf: [{ type: 'string' }], example: '6vDGVr652ztNWKZuHvsFvx' },
  })
  public async getVersionsOfOriginalPlaylist(
    @Param() params
  ): Promise<RemixedPlaylistInformation[]> {
    return this.playlistService.getVersionsOfOriginalPlaylist(
      params.playlistid
    );
  }

  /**
   * Compare a playlist to another one and return the diff.
   * @param body
   */
  @Post('compare')
  public async compare(@Body() body: PlaylistCompareRequest): Promise<Diff[]> {
    return this.playlistService.comparePlaylist(body.basePlaylistId, body.otherPlaylistId,);
  }

  /**
   * Clear entire playlist and put given songs in it
   * @param body
   */
  @Post('sync')
  public async syncRemixWithOriginal(
    @Body() body: PlaylistSyncRequest
  ): Promise<SyncPlaylistResult> {
    return this.playlistService.syncPlaylist(
      body.remixedPlaylistId,
      body.tracks
    );
  }
}
