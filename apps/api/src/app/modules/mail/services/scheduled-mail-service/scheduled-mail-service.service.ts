import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry} from '@nestjs/schedule';
import { MailService } from '../mail-service/mail.service';
import { EmailNotificationFrequency, Stopwatch } from '@spotify-manager/core';

@Injectable()
export class ScheduledMailServiceService implements OnModuleInit{
  private readonly logger = new Logger(ScheduledMailServiceService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly schedulerRegistry: SchedulerRegistry
  ) {
  }

  async onModuleInit() {
    // Wait for a tick to ensure the cron job is registered
    process.nextTick(() => {
      const allJobs = this.schedulerRegistry.getCronJobs();

      allJobs.forEach((value, key) => {
        this.logTimeUntilNextJobExecution(key);
      });
    });
  }

  private logTimeUntilNextJobExecution(jobName: string) {
    const job = this.schedulerRegistry.getCronJob(jobName);
    const nextDate = job.nextDate();
    const diff = nextDate.diffNow(['hours', 'minutes', 'seconds']).toObject();
    this.logger.log(`Job ${jobName} will execute in ${diff.hours} hours ${diff.minutes} minutes ${Math.floor(diff.seconds)} seconds`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'send-original-playlist-updated-emails'
  })
  async sendEmailDigests() {
    const sw = new Stopwatch();

    this.logger.log('Sending daily emails');
    sw.start();
    await this.mailService.sendOriginalPlaylistUpdatedEmails(EmailNotificationFrequency.DAILY);
    this.logger.log(`Daily emails sent, took: ${sw.stop()} ms`);

    this.logger.log("Sending weekly emails")
    sw.start();
    await this.mailService.sendOriginalPlaylistUpdatedEmails(EmailNotificationFrequency.WEEKLY);
    this.logger.log(`Weekly emails sent, took: ${sw.stop()} ms`);

    this.logger.log("Sending monthly emails")
    sw.start();
    await this.mailService.sendOriginalPlaylistUpdatedEmails(EmailNotificationFrequency.MONTHLY);
    this.logger.log(`Monthly emails sent, took: ${sw.stop()} ms`);
  }
}
