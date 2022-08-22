import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {PlaylistService} from '../../services/playlist/playlist.service';
import {ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {Diff, ForkedPlaylistInformation, PlaylistCompareRequest, PlaylistSyncRequest} from '@spotify/data';

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


  /**
   * Get the different versions available for the original playlist. These versions are created when the original playlists gets copied more than once
   * Each time a version is created, the user will have to choose which version to compare the forked playlist with when syncing.
   * @param params
   * @returns {Promise<ForkedPlaylistInformation>}
   */
  @Get('forks/:playlistid/versions')
  @ApiParam({
    name: 'playlistid',
    required: true,
    description: 'The ID of the original playlist',
    schema: {oneOf: [{type: 'string'}], example: '6vDGVr652ztNWKZuHvsFvx'}
  })
  public async getVersionsOfOriginalPlaylist(@Param() params): Promise<ForkedPlaylistInformation[]> {
    return this.playlistService.getVersionsOfOriginalPlaylist(params.playlistid)
  }

  /**
   * Compare a playlist to another one and return the diff.
   * @param {PlaylistCompareRequest} body
   * @returns {Promise<Diff[]>}
   */
  @Post('compare')
  public async compare(@Body() body: PlaylistCompareRequest): Promise<Diff[]> {
    return this.playlistService.comparePlaylist(body.leftPlaylistId, body.rightPlaylistId, body.versionTimestamp)
  }

  /**
   * Clear entire playlist and put given songs in it
   * @param {PlaylistSyncRequest} body
   */
  @Post('sync')
  public async syncForkWithOriginal(@Body() body: PlaylistSyncRequest): Promise<void> {
    return this.playlistService.syncPlaylist(body.playlistId, body.tracks)
  }
}
