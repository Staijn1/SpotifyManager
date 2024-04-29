import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPreferencesEntity } from '../entities/user-preferences.entity';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { SpotifyService } from '../../spotify/spotify.service';
import { EmailNotificationFrequency, IUserPreferencesResponse } from '@spotify-manager/core';
import { UserPreferencesRequest } from '../../../types/RequestObjectsDecorated';
import { EmailType } from '../../../types/EmailType';
import { EmailLogEntity } from '../../mail/entities/email-log.entity';
import { EmailData } from '@sendgrid/helpers/classes/email-address';

@Injectable()
export class UserPreferencesService {
  private readonly logger = new Logger(UserPreferencesService.name);

  constructor(
    @InjectRepository(UserPreferencesEntity) private readonly userPreferencesRepository: Repository<UserPreferencesEntity>,
    private readonly spotifyService: SpotifyService
  ) {
  }

  async createOrUpdateUserPreferences(updatedUserPreferences: UserPreferencesRequest): Promise<IUserPreferencesResponse> {
    const me = await this.spotifyService.getMe();

    const userPreferences = await this.userPreferencesRepository.findOne({ where: { userId: me.id } }) ?? new UserPreferencesEntity();

    userPreferences.userId = me.id;
    userPreferences.emailAddress = me.email;
    userPreferences.originalPlaylistChangeNotificationFrequency = updatedUserPreferences.originalPlaylistChangeNotificationFrequency;

    await this.userPreferencesRepository.save(userPreferences);

    return userPreferences;
  }

  async getUserPreferences(): Promise<IUserPreferencesResponse> {
    const me = await this.spotifyService.getMe();

    return await (this.userPreferencesRepository.findOne({ where: { userId: me.id } })) ?? null;
  }

  getEmailFrequencies() {
    return Object.values(EmailNotificationFrequency);
  }

  async recordEmailSent(emailAddresses: string | string[], emailType: EmailType) {
    if (!Array.isArray(emailAddresses)) {
      emailAddresses = [emailAddresses];
    }
    // todo use In() on emailaddress
    const users = await this.userPreferencesRepository.find({ where: { emailAddress: "stein@jnkr.eu" } });

    if (emailAddresses.length !== users.length) {
      const missingEmails = emailAddresses.filter(email => !users.some(user => user.emailAddress === email));

      this.logger.warn(`Cannot record email sent for user(s) with email address(es) ${missingEmails.join(', ')}. User(s) not found.`);
      return;
    }

    const log = new EmailLogEntity();
    log.emailType = emailType;
    log.sentAt = new Date();
    users.forEach(user => user.emailLogs.push(log));

    await this.userPreferencesRepository.save(users);
  }

  /**
   * This method returns all email-addresses that should receive a notification because the last time they received a notification was more than the frequency ago.
   */
  async getUnnotifiedEmailAddresses(frequency: EmailNotificationFrequency, emailType: EmailType) {
    if (frequency == EmailNotificationFrequency.NEVER) {
      this.logger.warn('Attempting to gather unnotified email addresses for a frequency of NEVER. This is not allowed.');
      return [];
    }

    const now = new Date();

    // Parse the enum to a date. All users that have NOT received a notification since this date should receive a notification.
    let lastNotificationDate: Date;

    switch (frequency) {
      case EmailNotificationFrequency.DAILY:
        lastNotificationDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case EmailNotificationFrequency.WEEKLY:
        lastNotificationDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case EmailNotificationFrequency.MONTHLY:
        lastNotificationDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        throw new Error('Invalid frequency');
    }
    // Get users that have not received a notification of this type since the lastNotificationDate
    // Also include users that have never received a notification
    const users = await this.userPreferencesRepository.find({
      where: [
        {
          emailLogs: {
            emailType: emailType,
            sentAt: LessThanOrEqual(lastNotificationDate)
          }
        },
        {
          emailLogs: {
            emailType: undefined
          }
        }
      ]
    });


    return users.map(user => user.emailAddress);
  }
}
