import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserPreferencesService } from '../../../user-preferences/services/user-preferences.service';
import { EmailType } from '../../../../types/EmailType';
import { DiffIdentifier, EmailNotificationFrequency, Utils } from '@spotify-manager/core';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { PlaylistService } from '../../../playlist/services/playlist/playlist.service';
import { SpotifyService } from '../../../spotify/spotify/spotify.service';


@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly playlistService: PlaylistService,
    private readonly spotifyService: SpotifyService,
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
    await this.mailerService.sendMail(options);
    this.logger.log(`Sent email successfully`);
  }

  async testMail() {
    await this.sendMail({
      to: 'stein@jnkr.eu',
      subject: 'Test',
      text: 'Test',
      template: './test',
      context: {
        name: 'Testing A Name'
      }
    });
    await this.userPreferenceService.recordEmailSent('stein@jnkr.eu', EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);
  }

  /**
   * For each user that has not been notified for the given frequency, send an email if one of the original playlists have been updated of their remixed playlists.
   * @param frequency
   */
  async sendOriginalPlaylistUpdatedEmails(frequency: EmailNotificationFrequency) {
    this.logger.log('Starting change-detection for original playlist of remixed playlists');
    const users = await this.userPreferenceService.getUnnotifiedUsers(frequency, EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);

    const promises = [];
    let amountOfUsersWithUpdatedOriginalPlaylists = 0;
    for (const user of users) {
      const spotifyUser = await this.spotifyService.getUser(user.userId);
      const remixes = (await this.playlistService.getRemixedPlaylists(user.userId)).items;

      const userEmailContext: OriginalPlaylistUpdatedEmailContext = {
        updatedRemixes: [],
        user: {
          email: user.emailAddress,
          username: spotifyUser.display_name
        },
        appInfo: {
          github: 'https://github.com/Staijn1/SpotifyManager',
          appUrl: 'https://spotify.steinjonker.nl'
        }
      };

      for (const remix of remixes) {
        const originalPlaylistId = Utils.GetOriginalPlaylistIdFromDescription(remix.description);
        const differences = await this.playlistService.compareRemixedPlaylistWithOriginal(originalPlaylistId, remix.id, user.userId);
        const songsAddedInOriginal = differences.filter(diff => diff[0] === DiffIdentifier.ADDED_IN_ORIGINAL);
        const songsRemovedInOriginal = differences.filter(diff => diff[0] === DiffIdentifier.REMOVED_IN_ORIGINAL);

        // Stop if no songs have been added or removed
        if (songsAddedInOriginal.length == 0 && songsRemovedInOriginal.length == 0) {
          continue;
        }

        userEmailContext.updatedRemixes.push({
          amountOfSongsAddedInOrginal: songsAddedInOriginal.length,
          amountOfSongsRemovedInOriginal: songsRemovedInOriginal.length,
          playlistTitle: remix.name,
          playlistUrl: remix.external_urls.spotify,
          playlistCoverUrl: remix.images[0].url
        });
      }

      if (userEmailContext.updatedRemixes.length == 0) {
        this.logger.log(`No updates found for user ${user.userId}`);
        continue;
      }

      promises.push(
        this.sendMail({
          to: user.emailAddress,
          subject: 'Spotify Manager - Original playlist updated',
          template: './original-playlist-updated',
          context: userEmailContext
        }),
        this.userPreferenceService.recordEmailSent(user.emailAddress, EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION)
      );

      amountOfUsersWithUpdatedOriginalPlaylists = amountOfUsersWithUpdatedOriginalPlaylists + 1;
    }

    this.logger.log(`Done processing change-detection for remixed playlists. ${amountOfUsersWithUpdatedOriginalPlaylists} user(s) will be notified, sending emails now`);
    try {
      await Promise.all(promises);
    } catch (e) {
      this.logger.error('An error occurred while sending original playlist change notifications');
      this.logger.error(e);
    }
  }
}

export type OriginalPlaylistUpdatedEmailContext = {
  updatedRemixes: {
    amountOfSongsAddedInOrginal: number,
    amountOfSongsRemovedInOriginal: number,
    playlistTitle: string,
    playlistUrl: string
    playlistCoverUrl: string
  }[];

  user: {
    email: string,
    username: string
  }

  appInfo: {
    github: string,
    appUrl: string
  }
}
