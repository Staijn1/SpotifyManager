import { Module } from '@nestjs/common';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';
import { ScheduledMailServiceService } from './services/scheduled-mail-service/scheduled-mail-service.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './services/mail-service/mail.service';


@Module({
  providers: [MailService, ScheduledMailServiceService],
  imports: [
    UserPreferencesModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.example.com',
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'topsecret'
        }
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>'
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true
        }
      }
    })
  ],
  exports: [MailService]
})
export class MailModule {}
