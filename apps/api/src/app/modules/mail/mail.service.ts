import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Address, ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService) {
  }

  async sendUserConfirmation(user: { email: string; name: string }) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to our platform',
      template: './user-confirmation',
      context: {
        name: user.name
      }
    });
  }


  private async sendMail(mailOptions: ISendMailOptions) {
    const overrideEmail = this.configService.get('OVERRIDE_EMAIL');

    // OverrideEmail is a comma seperated list of emails to override emails to, or it is NONE. If undefined or empty string no emails are sent
    if (!overrideEmail) {
      this.logger.warn('No override email set, no emails will be sent. To send emails to real users set OVERRIDE_EMAIL to NONE');
      return;
    }

    let recipients: string | Address | (string | Address)[];
    if (overrideEmail !== 'NONE') {
      recipients = overrideEmail.split(',');
    }

    mailOptions.to = recipients ?? mailOptions.to;

    await this.mailerService.sendMail(mailOptions);
  }
}
