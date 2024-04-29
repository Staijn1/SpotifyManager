import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';


@Module({
  providers: [MailService],
  imports: [UserPreferencesModule],
  exports: [MailService]
})
export class MailModule {}
