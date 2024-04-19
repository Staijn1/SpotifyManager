import { Column, Entity, ObjectId, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity('playlist_remix')
export class PlaylistRemixEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @PrimaryColumn()
  originalPlaylistId: string;
  @PrimaryColumn()
  remixPlaylistId: string;

  @Column()
  timestamp: Date;

  @Column('simple-array')
  originalPlaylistTrackIds: string[];
}
