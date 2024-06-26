import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMailService } from './scheduled-mail.service';
import { MailService } from '../mail-service/mail.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SpotifyAuthenticationService } from '../../../spotify/authentication/spotify-authentication.service';

describe('ScheduledMailService', () => {
  let service: ScheduledMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledMailService,
        {
          provide: MailService,
          useValue: jest.fn()
        },
        {
          provide: SchedulerRegistry,
          useValue: jest.fn()
        },
        {
          provide: SpotifyAuthenticationService,
          useValue: jest.fn()
        }
      ],
    }).compile();

    service = module.get<ScheduledMailService>(ScheduledMailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
