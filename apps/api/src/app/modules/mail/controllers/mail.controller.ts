import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from '../services/mail-service/mail.service';
import { EmailNotificationFrequency } from '@spotify-manager/core';

@ApiBearerAuth()
@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {
  }

  @Post('original-playlist-update-notifications')
  public async originalPlaylistUpdateNotifications(): Promise<void> {
    return this.mailService.sendOriginalPlaylistUpdatedEmails();
  }
}
