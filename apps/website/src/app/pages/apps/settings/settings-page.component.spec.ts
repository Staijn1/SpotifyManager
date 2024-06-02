import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPageComponent } from './settings-page.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ApiService } from '../../../services/api/api.service';
import { MessageService } from '../../../services/message/message.service';
import { UserPreferenceService } from '../../../services/user-preference/user-preference.service';

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getMyRemixedPlaylists: jest.fn().mockResolvedValue({}),
          }
        },
        {
          provide: MessageService,
          useValue: {
            setMessage: jest.fn(),
            getMessages: jest.fn()
          }
        },
        {
          provide: UserPreferenceService,
          useValue: {
            getUserPreferences: jest.fn().mockResolvedValue({}),
            saveUserPreference: jest.fn().mockResolvedValue({}),
            getEmailFrequencyOptions: jest.fn().mockResolvedValue([])
          }
        },
        provideMockStore({})
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
