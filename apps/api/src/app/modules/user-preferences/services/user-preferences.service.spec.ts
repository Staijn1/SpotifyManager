import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesService } from './user-preferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPreferencesEntity } from '../entities/user-preferences.entity';
import { SpotifyService } from '../../spotify/spotify/spotify.service';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { EmailNotificationFrequency } from '@spotify-manager/core';
import { EmailType } from '../../../types/EmailType';
import { DateTime } from 'luxon';

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
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.DAILY,
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: []
        },
        {
          userId: '2',
          emailAddress: 'test2@example.com',
          emailLogs: [],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY,
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: []
        },
        {
          userId: '3',
          emailAddress: 'test3@example.com',
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: [],
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
      const result = await service.getUnnotifiedUsers(EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);

      // Assert
      expect(result.map(x => x.userId)).toEqual(['1', '2']);
    });

    it('should return all users that have not received this email type since their set email-preference', async () => {
      const mockUsers: UserPreferencesEntity[] = [
        {
          userId: '1',
          emailAddress: 'test1@example.com',
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: [],
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly one week ago
              sentAt: DateTime.now().minus({ weeks: 1 }).toJSDate()
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY
        },
        {
          userId: '2',
          emailAddress: 'test2@example.com',
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: [],
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly one day ago
              sentAt: DateTime.now().minus({ days: 1 }).toJSDate()
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.DAILY
        },
        {
          userId: '3',
          emailAddress: 'test3@example.com',
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: [],
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly one month ago
              sentAt: DateTime.now().minus({ months: 1 }).toJSDate()
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.MONTHLY
        },
        {
          userId: '4',
          emailAddress: 'test4@example.com',
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: [],
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
      const result = await service.getUnnotifiedUsers(EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);

      // Assert
      expect(result.map(x => x.userId)).toEqual(['1', '2', '3']);
    });


    it('should only use the last known email log for the email type to determine if user must be notified', async () => {
      // Arrange
      const mockUsers: UserPreferencesEntity[] = [
        {
          userId: '1',
          emailAddress: 'test1@example.com',
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: [],
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly six days ago (should not be notified because of weekly frequency preference)
              sentAt: DateTime.now().minus({ days: 6 }).toJSDate()
            },
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly 14 days ago
              sentAt: DateTime.now().minus({ days: 14 }).toJSDate()
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY
        },
        {
          userId: '2',
          emailAddress: 'test2@example.com',
          excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: [],
          emailLogs: [
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly 23 hours ago (should not be notified because of daily frequency preference)
              sentAt: DateTime.now().minus({ hours: 23 }).toJSDate()
            },
            {
              emailType: EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION,
              // Today exactly 48 hours ago
              sentAt: DateTime.now().minus({ hours: 48 }).toJSDate()
            }
          ],
          id: new ObjectId(),
          originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.DAILY
        }
      ];

      jest.spyOn(userPreferencesRepository, 'find').mockResolvedValue(mockUsers);

      // Act
      const result = await service.getUnnotifiedUsers(EmailType.ORIGINAL_PLAYLIST_CHANGE_NOTIFICATION);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
