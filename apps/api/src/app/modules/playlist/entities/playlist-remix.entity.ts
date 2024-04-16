import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class PlaylistRemixEntity {
  @PrimaryColumn()
  originalPlaylistId: string;
  @PrimaryColumn()
  remixPlaylistId: string;

  @Column()
  timestamp: Date;

  @Column('simple-array')
  originalPlaylistTrackIds: string[];
}
