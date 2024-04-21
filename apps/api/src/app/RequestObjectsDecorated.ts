import { ApiProperty } from '@nestjs/swagger';
import {
  EmailNotificationFrequency,
  EpisodeObjectFull,
  ICompareRemixedPlaylistRequest,
  IPlaylistSyncRequest, IUserPreferencesRequest,
  TrackObjectFull
} from '@spotify-manager/core';

export class CompareRemixedPlaylistRequest implements ICompareRemixedPlaylistRequest {
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
}

export class PlaylistSyncRequest implements IPlaylistSyncRequest {
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


export class UserPreferencesRequest implements IUserPreferencesRequest {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency;
}
