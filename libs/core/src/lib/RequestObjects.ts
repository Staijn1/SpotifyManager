import { ApiProperty } from '@nestjs/swagger';
import { EpisodeObjectFull, TrackObjectFull } from './SpotifyAPI';

export class PlaylistCompareRequest {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  leftPlaylistId: string | undefined;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  rightPlaylistId?: string;
  @ApiProperty({
    type: 'number',
    required: false,
  })
  versionTimestamp?: number;
}

export class PlaylistSyncRequest {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  originalPlaylistId!: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  remixedPlaylistId!: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  tracks: (TrackObjectFull | EpisodeObjectFull)[] = [];
}
