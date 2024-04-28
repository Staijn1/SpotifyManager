import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import nodemailerSendgrid from 'nodemailer-sendgrid';

const sendgridTransport = nodemailerSendgrid({
  apiKey: process.env.SENDGRID_API_KEY,
});

@Module({
  imports: [
    MailerModule.forRoot({
     // or
      transport: sendgridTransport,
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
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
