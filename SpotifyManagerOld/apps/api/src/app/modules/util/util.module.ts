import { Module } from '@nestjs/common';
import {FileService} from './services/file/file.service';

@Module({
  providers: [FileService],
  exports: [FileService],
})
export class UtilModule {}
