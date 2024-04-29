import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';
import { EmailType } from '../../../types/EmailType';

@Entity('user_email_logs')
export class UserEmailLogEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  email: string;

  @Column()
  sentAt: Date;

  @Column()
  emailType: EmailType;
}
