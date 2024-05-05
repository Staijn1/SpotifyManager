import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMailServiceService } from './scheduled-mail-service.service';
import { MailService } from '../mail-service/mail.service';

describe('ScheduledMailServiceService', () => {
  let service: ScheduledMailServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledMailServiceService,
        {
          provide: MailService,
          useValue: jest.fn()
        }
      ],
    }).compile();

    service = module.get<ScheduledMailServiceService>(ScheduledMailServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
