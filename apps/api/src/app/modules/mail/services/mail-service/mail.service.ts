import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserPreferencesService } from '../../../user-preferences/services/user-preferences.service';
import { EmailType } from '../../../../types/EmailType';
import { EmailNotificationFrequency } from '@spotify-manager/core';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import * as path from 'node:path';


@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly userPreferenceService: UserPreferencesService) {
  }

  private async sendMail(options: ISendMailOptions) {
    const overrideEmail = this.configService.get('OVERRIDE_EMAIL');
    // OverrideEmail is a comma seperated list of emails to override emails to, or it is NONE. If undefined or empty string no emails are sent
    if (!overrideEmail) {
      this.logger.warn('No override email set, no emails will be sent. To send emails to real users set OVERRIDE_EMAIL to NONE');
      return;
    }

    let recipients: string[] = [];
    if (overrideEmail !== 'NONE') {
      recipients = overrideEmail.split(',');
    }

    options.to = recipients.length == 0 ? options.to : recipients;
    // todo: remove
    console.log(options)
    const result = await this.mailerService.sendMail(options);
    console.log(result)
  }

  async testMail() {
    await this.sendMail({
      to: 'stein@jnkr.eu',
      subject: 'Test',
      text: 'Test',
      template: './test',
      context: {
        name: "Testing A Name"
      }
    });
    await this.userPreferenceService.recordEmailSent('stein@jnkr.eu', EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);
  }

  /**
   * For each user that has not been notified for the given frequency, send an email if one of the original playlists have been updated of their remixed playlists.
   * @param frequency
   */
  async sendOriginalPlaylistUpdatedEmails(frequency: EmailNotificationFrequency) {
    const users = await this.userPreferenceService.getUnnotifiedEmailAddresses(frequency, EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);
    for (const user of users) {
      // todo get remixed playlists for this user
      // todo compare remixed playlist with original playlist
      // todo if original playlist has been updated, send email and record email sent

      //eslint-disable-next-line
      let hasAnyOriginalPlaylistChanged = false;

      if (!hasAnyOriginalPlaylistChanged) {
        continue;
      }

      await this.sendMail({
        to: user,
        subject: 'Original playlist updated',
        text: 'One of your original playlist has been updated'
      });
      await this.userPreferenceService.recordEmailSent(user, EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);
    }
  }
}
