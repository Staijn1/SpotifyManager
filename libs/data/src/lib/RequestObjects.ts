import {ApiProperty} from '@nestjs/swagger';

export class PlaylistCompareRequest {
  @ApiProperty({
    type: 'string',
    required: true
  })
  leftPlaylistId: string | undefined;
  @ApiProperty({
      type: 'string',
      required: true,
    }
  )
  rightPlaylistId?: string;
  @ApiProperty({
    type: 'number',
    required: false
  })
  versionTimestamp?: number;
}
