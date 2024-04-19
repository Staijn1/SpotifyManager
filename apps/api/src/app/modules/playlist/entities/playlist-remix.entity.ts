import { Column, Entity, ObjectId, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity('playlist_remix')
export class PlaylistRemixEntity {

  constructor(originalPlaylistId: string, remixPlaylistId: string, userId: string, timestamp?: Date, originalPlaylistTrackIds?: string[]) {
    this.originalPlaylistId = originalPlaylistId;
    this.remixPlaylistId = remixPlaylistId;
    this.userId = userId;
    this.timestamp = timestamp;
    this.originalPlaylistTrackIds = originalPlaylistTrackIds;
  }

  @ObjectIdColumn()
  id: ObjectId;

  @PrimaryColumn()
  originalPlaylistId: string;
  @PrimaryColumn()
  remixPlaylistId: string;
  @PrimaryColumn()
  userId: string;

  @Column()
  timestamp: Date;

  @Column('simple-array')
  originalPlaylistTrackIds: string[];
}
