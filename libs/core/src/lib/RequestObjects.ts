import { ApiProperty } from '@nestjs/swagger';
import { EpisodeObjectFull, TrackObjectFull } from './SpotifyAPI';

export class PlaylistCompareRequest {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  basePlaylistId!: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  otherPlaylistId!: string;
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
