import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPageComponent } from './settings-page.component';
import { provideMockStore } from '@ngrx/store/testing';
import { UserPreferenceService } from '../../services/user-preference/user-preference.service';

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [
        {
          provide: UserPreferenceService,
          useValue: {
            getUserPreferences: jest.fn().mockResolvedValue({}),
            saveUserPreference: jest.fn().mockResolvedValue({}),
            getEmailFrequencyOptions: jest.fn().mockResolvedValue([])
          },
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
