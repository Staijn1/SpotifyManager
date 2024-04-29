import { Module } from '@nestjs/common';
import { MailService } from './services/mail-service/mail.service';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';
import { ScheduledMailServiceService } from './services/scheduled-mail-service/scheduled-mail-service.service';


@Module({
  providers: [MailService, ScheduledMailServiceService],
  imports: [UserPreferencesModule],
  exports: [MailService]
})
export class MailModule {}
