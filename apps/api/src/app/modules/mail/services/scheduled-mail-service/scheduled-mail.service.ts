import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { MailService } from '../mail-service/mail.service';
import { Stopwatch } from '@spotify-manager/core';
import { SpotifyAuthenticationService } from '../../../spotify/authentication/spotify-authentication.service';

@Injectable()
export class ScheduledMailService implements OnModuleInit {
  private readonly logger = new Logger(ScheduledMailService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly spotifyAuthService: SpotifyAuthenticationService
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

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'send-original-playlist-updated-emails'
  })
  async sendEmailDigests() {
    await this.executeJob('send-original-playlist-updated-emails', async () => {
      await this.mailService.sendOriginalPlaylistUpdatedEmails();
    });
  }

  private async executeJob(jobName: string, method: () => Promise<void>) {
    this.logger.log(`Executing job ${jobName}`);

    await this.spotifyAuthService.authenticateWithClientCredentials();

    const sw = new Stopwatch();
    sw.start();

    await method();

    this.logger.log(`Job ${jobName} executed, took: ${sw.stop()} ms`);
  }
}
