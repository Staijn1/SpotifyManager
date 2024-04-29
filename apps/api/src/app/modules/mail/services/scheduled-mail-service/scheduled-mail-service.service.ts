import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail-service/mail.service';
import { EmailNotificationFrequency, Stopwatch } from '@spotify-manager/core';

@Injectable()
export class ScheduledMailServiceService {
  private readonly logger = new Logger(ScheduledMailServiceService.name);

  constructor(private readonly mailService: MailService) {
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'send-original-playlist-updated-emails'
  })
  async sendEmailDigests() {
    const sw = new Stopwatch();

    this.logger.log('Sending daily emails');
    sw.start();
    await this.mailService.sendOriginalPlaylistUpdatedEmail(EmailNotificationFrequency.DAILY);
    this.logger.log(`Daily emails sent, took: ${sw.stop()} ms`);

    this.logger.log("Sending weekly emails")
    sw.start();
    await this.mailService.sendOriginalPlaylistUpdatedEmail(EmailNotificationFrequency.WEEKLY);
    this.logger.log(`Weekly emails sent, took: ${sw.stop()} ms`);

    this.logger.log("Sending monthly emails")
    sw.start();
    await this.mailService.sendOriginalPlaylistUpdatedEmail(EmailNotificationFrequency.MONTHLY);
    this.logger.log(`Monthly emails sent, took: ${sw.stop()} ms`);
  }
}
