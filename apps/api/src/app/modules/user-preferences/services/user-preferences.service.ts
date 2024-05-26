import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPreferencesEntity } from '../entities/user-preferences.entity';
import { Repository } from 'typeorm';
import { SpotifyService } from '../../spotify/spotify/spotify.service';
import { EmailNotificationFrequency, IUserPreferencesResponse } from '@spotify-manager/core';
import { UserPreferencesRequest } from '../../../types/RequestObjectsDecorated';
import { EmailType } from '../../../types/EmailType';
import { EmailLogEntity } from '../../mail/entities/email-log.entity';
import { DateTime } from 'luxon';

@Injectable()
export class UserPreferencesService {
  private readonly logger = new Logger(UserPreferencesService.name);
  /**
   * This map is used to map an email type to the corresponding field in the UserPreferencesEntity that hold the preferred frequency for that email type.
   * @private
   */
  private readonly emailTypePreferenceMap = new Map<EmailType, keyof UserPreferencesEntity>([
    [EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION, 'originalPlaylistChangeNotificationFrequency']
  ]);

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
    // Add or remove playlist IDs from excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications
    userPreferences.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications = updatedUserPreferences.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications ?? [];

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

    const users = await this.userPreferencesRepository.find({
      where: {
        emailAddress: {
          $in: emailAddresses
          // Cast to never because of stupid TypeORM typing
        } as never
      }
    });

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
  async getUnnotifiedUsers(emailType: EmailType) {
    const allUsers = await this.userPreferencesRepository.find();
    const userFrequencyField = this.emailTypePreferenceMap.get(emailType);

    // Return all users that should be notified
    return allUsers.filter(user => {
      const userPreferenceForThisEmailType = user[userFrequencyField];

      // If the user has set the frequency to NEVER, they should never be notified
      if (userPreferenceForThisEmailType === EmailNotificationFrequency.NEVER) {
        return false;
      }

      // Sort the emailLogs array in descending order based on the sentAt field, that way the most recent email is the first element
      const sortedEmailLogs = user.emailLogs.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());

      // User should be notified if:
      // - No email log is present for the given type, or
      // - The most recent email log of the given email type was sent before the last notification date
      const hasNoEmailLogForType = !sortedEmailLogs.some(log => log.emailType === emailType);
      if (hasNoEmailLogForType) return true;

      const mostRecentEmailLogForType = sortedEmailLogs.find(log => log.emailType === emailType);
      const sentAtDateTime = DateTime.fromJSDate(mostRecentEmailLogForType.sentAt);

      let lastNotificationDate: DateTime;
      switch (userPreferenceForThisEmailType) {
        case EmailNotificationFrequency.DAILY:
          lastNotificationDate = DateTime.now().minus({ days: 1 });
          break;
        case EmailNotificationFrequency.WEEKLY:
          lastNotificationDate = DateTime.now().minus({ weeks: 1 });
          break;
        case EmailNotificationFrequency.MONTHLY:
          lastNotificationDate = DateTime.now().minus({ months: 1 });
          break;
        default:
          throw new Error(`Unknown email notification frequency found for user ${user.userId}: ${userPreferenceForThisEmailType}`);
      }

      return hasNoEmailLogForType || sentAtDateTime <= lastNotificationDate;
    });
  }

  async addPlaylistToIgnoreList(userid: string, playlistIdToIgnore: string) {
    const userPreferences = await this.userPreferencesRepository.findOne({ where: { userId: userid } });

    if (!userPreferences) {
      throw new Error(`User with ID ${userid} not found`);
    }

    // Add the playlist ID to the list of ignored playlists if it's not already in there
    if (!userPreferences.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications.includes(playlistIdToIgnore)) {
      userPreferences.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications.push(playlistIdToIgnore);
    }

    await this.userPreferencesRepository.save(userPreferences);
  }
}
