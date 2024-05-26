import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserPreferencesService } from '../../../user-preferences/services/user-preferences.service';
import { EmailType } from '../../../../types/EmailType';
import { DiffIdentifier, EmailNotificationFrequency, Utils } from '@spotify-manager/core';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { PlaylistService } from '../../../playlist/services/playlist/playlist.service';
import { SpotifyService } from '../../../spotify/spotify/spotify.service';
import { environment } from '../../../../../environments/environment';

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

  async sendOriginalPlaylistUpdatedEmails() {
    this.logger.log('Starting change-detection for original playlist of remixed playlists');
    const users = await this.userPreferenceService.getUnnotifiedUsers(EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);

    const promises: Map<string, Promise<any>[]> = new Map();
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
        },
        synchronizePlaylistUrl: this.getSynchronizePlaylistUrl()
      };

      const remixesNotIgnored = remixes.filter(remix => !user.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications.includes(remix.id));
      for (const remix of remixesNotIgnored) {
        const differences = await this.playlistService.compareRemixedPlaylistWithOriginal(remix.id, user.userId);
        const songsAddedInOriginal = differences.filter(diff => diff[0] === DiffIdentifier.ADDED_IN_ORIGINAL);
        const songsRemovedInOriginal = differences.filter(diff => diff[0] === DiffIdentifier.REMOVED_IN_ORIGINAL);

        if (songsAddedInOriginal.length == 0 && songsRemovedInOriginal.length == 0) {
          continue;
        }

        userEmailContext.updatedRemixes.push({
          amountOfSongsAddedInOrginal: songsAddedInOriginal.length,
          amountOfSongsRemovedInOriginal: songsRemovedInOriginal.length,
          playlistTitle: remix.name,
          playlistUrl: remix.external_urls.spotify,
          playlistCoverUrl: remix.images[0].url,
          synchronizePlaylistUrl: `${userEmailContext.synchronizePlaylistUrl}/${remix.id}`
        });
      }

      if (userEmailContext.updatedRemixes.length == 0) {
        this.logger.log(`No updates found for user ${user.userId}`);
        continue;
      }

      const promisesForUser = promises.get(user.userId) ?? [];
      promisesForUser.push(
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

    for (const userPromises of promises.entries()) {
      try {
        const promises = userPromises[1];
        await Promise.all(promises);
      } catch (e) {
        this.logger.error(`Failed to complete sending emails for user ${userPromises[0]}`);
        this.logger.error(e);
      }
    }
  }

  private getSynchronizePlaylistUrl(): string {
    return environment.production ? 'https://spotify.steinjonker.nl/sync-remixed-playlist' : 'http://localhost:4200/sync-remixed-playlist';
  }
}

export type OriginalPlaylistUpdatedEmailContext = {
  updatedRemixes: {
    amountOfSongsAddedInOrginal: number,
    amountOfSongsRemovedInOriginal: number,
    playlistTitle: string,
    playlistUrl: string,
    playlistCoverUrl: string,
    synchronizePlaylistUrl: string
  }[];

  user: {
    email: string,
    username: string
  };

  appInfo: {
    github: string,
    appUrl: string
  };

  synchronizePlaylistUrl: string;
}
