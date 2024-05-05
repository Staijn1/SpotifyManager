import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Post } from '@nestjs/common';
import { MailService } from '../services/mail-service/mail.service';

@ApiBearerAuth()
@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {
  }


  @Post('testmail')
  public async testMail(): Promise<void> {
    return this.mailService.testMail();
  }
}

