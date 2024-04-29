import { Column, Entity } from 'typeorm';
import { EmailType } from '../../../types/EmailType';

@Entity()
export class EmailLogEntity {
  @Column()
  userId: string;

  @Column()
  sentAt: Date;

  @Column()
  emailType: EmailType;
}
