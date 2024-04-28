import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailData } from '@sendgrid/helpers/classes/email-address';
import sgMail from '@sendgrid/mail';


@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService) {
    sgMail.setApiKey(configService.get('SENDGRID_API_KEY'));
  }

  private async sendMail(optionsOverride: Omit<sgMail.MailDataRequired, 'from'>) {
    const mailoptions = {
      ...{
        from: this.configService.get('FROM_EMAIL'),
        to: optionsOverride.to,
        subject: optionsOverride.subject,
        text: optionsOverride.text,
        html: optionsOverride.html
      },
      ...optionsOverride
    };
    const overrideEmail = this.configService.get('OVERRIDE_EMAIL');

    // OverrideEmail is a comma seperated list of emails to override emails to, or it is NONE. If undefined or empty string no emails are sent
    if (!overrideEmail) {
      this.logger.warn('No override email set, no emails will be sent. To send emails to real users set OVERRIDE_EMAIL to NONE');
      return;
    }

    let recipients: EmailData | EmailData[];
    if (overrideEmail !== 'NONE') {
      recipients = overrideEmail.split(',');
    }

    mailoptions.to = recipients ?? optionsOverride.to;
    await sgMail.send(mailoptions);
  }

  async testMail() {
    return this.sendMail({
      to: 'stein@jnkr.eu',
      subject: 'Test'

    });
  }
}
