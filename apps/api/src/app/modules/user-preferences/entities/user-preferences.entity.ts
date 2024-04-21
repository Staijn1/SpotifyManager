import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { EmailNotificationFrequency } from '@spotify-manager/core';

@Entity('user_preferences')
export class UserPreferencesEntity {
  @PrimaryGeneratedColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency;
}

