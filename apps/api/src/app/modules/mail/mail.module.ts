import { Module } from '@nestjs/common';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';
import { ScheduledMailService } from './services/scheduled-mail-service/scheduled-mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './services/mail-service/mail.service';
import { ConfigService } from '@nestjs/config';
import { PlaylistModule } from '../playlist/playlist.module';
import { SpotifyModule } from '../spotify/spotify.module';


@Module({
  providers: [MailService, ScheduledMailService],
  controllers: [],
  imports: [
    UserPreferencesModule,
    PlaylistModule,
    SpotifyModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          secure: Boolean(config.get('MAIL_SECURE')),
          port: config.get('MAIL_PORT'),
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          }
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'assets', 'mail-templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      })
    })
  ],
  exports: [MailService]
})
export class MailModule {
}
