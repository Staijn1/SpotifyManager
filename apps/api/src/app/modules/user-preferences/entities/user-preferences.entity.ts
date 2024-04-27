import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { EmailNotificationFrequency } from '@spotify-manager/core';

@Entity('user_preferences')
export class UserPreferencesEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency;
}

