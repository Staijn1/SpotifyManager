import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesService } from './user-preferences.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencesEntity } from '../entities/user-preferences.entity';
import { repositoryMockFactory } from '../../../utilities/testing-utils';
import { SpotifyService } from '../../spotify/spotify/spotify.service';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { EmailNotificationFrequency } from '@spotify-manager/core';
import { EmailType } from '../../../types/EmailType';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let userPreferencesRepository: Repository<UserPreferencesEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        {
          provide: getRepositoryToken(UserPreferencesEntity),
          useClass: Repository,
        },
        {
          provide: SpotifyService,
          useValue: jest.fn()
        }
      ]
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
    userPreferencesRepository = module.get(getRepositoryToken(UserPreferencesEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Unnotified Users', () => {
    it('should return all users that have never received this email type', async () => {
      // Arrange
      const mockUsers: UserPreferencesEntity[] = [
        {
          userId: '1',
          emailAddress: 'test1@example.com',
          emailLogs: [],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.DAILY
        },
        {
          userId: '2',
          emailAddress: 'test2@example.com',
          emailLogs: [],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY
        },
        {
          userId: '3',
          emailAddress: 'test3@example.com',
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              sentAt: new Date()
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY
        }
      ];

      jest.spyOn(userPreferencesRepository, 'find').mockResolvedValue(mockUsers);

      // Act
      const result = await service.getUnnotifiedUsers(EmailNotificationFrequency.DAILY, EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);

      // Assert
      expect(result.map(x => x.userId)).toEqual(['1', '2']);
    });

    it('should return all users that have not received this email type since their set email-preference', async () => {
      const mockUsers: UserPreferencesEntity[] = [
        {
          userId: '1',
          emailAddress: 'test1@example.com',
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly one week ago
              sentAt: new Date(new Date().setDate(new Date().getDate() - 7))
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY
        },
        {
          userId: '2',
          emailAddress: 'test2@example.com',
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly one day ago
              sentAt: new Date(new Date().setDate(new Date().getDate() - 1))
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.DAILY
        },
        {
          userId: '3',
          emailAddress: 'test3@example.com',
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly one month ago
              sentAt: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.MONTHLY
        },
        {
          userId: '4',
          emailAddress: 'test4@example.com',
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Any date
              sentAt: new Date()
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.NEVER
        }
      ];

      jest.spyOn(userPreferencesRepository, 'find').mockResolvedValue(mockUsers);

      // Act
      const result = await service.getUnnotifiedUsers(EmailNotificationFrequency.DAILY, EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);

      // Assert
      expect(result.map(x => x.userId)).toEqual(['1', '2', '3']);
    });
  });
});
