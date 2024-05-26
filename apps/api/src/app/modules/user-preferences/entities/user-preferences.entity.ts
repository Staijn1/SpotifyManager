import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { EmailNotificationFrequency } from '@spotify-manager/core';
import { EmailLogEntity } from '../../mail/entities/email-log.entity';

@Entity('user_preferences')
export class UserPreferencesEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency;

  @Column()
  emailAddress: string;

  @Column(() => EmailLogEntity)
  emailLogs: EmailLogEntity[] = [];

  @Column('simple-array')
  excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: string[] = [];
}
