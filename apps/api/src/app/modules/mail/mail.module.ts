import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { UserEmailLogEntity } from './entities/UserEmailLog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  providers: [MailService],
  imports: [TypeOrmModule.forFeature([UserEmailLogEntity])],
  exports: [MailService]
})
export class MailModule {}
