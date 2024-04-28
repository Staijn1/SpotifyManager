import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferenceService } from '../../services/user-preference/user-preference.service';
import { EmailNotificationFrequency, IUserPreferences, IUserPreferencesResponse } from '@spotify-manager/core';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../types/SpotifyManagerUserState';
import { ReceiveUserPreferences } from '../../redux/user-state/user-state.action';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  readonly informationIcon = faInfoCircle;
  availableEmailFrequencyOptions: EmailNotificationFrequency[] = [];

  // Defaults for when the user first logs in and has no preferences
  userPreferences: IUserPreferences = {
    originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY
  };
  hasUserPreferencesSet = false;

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly store: Store<{ userState: SpotifyManagerUserState }>) {
    this.store.select('userState')
      .pipe(map(state => state.userPreferences))
      .subscribe(preferences => {
        this.hasUserPreferencesSet = preferences !== null;

        // If the user logs in and has no preferences, the defaults will be used otherwise the user's preferences will be used
        // Create a copy of the preferences because the object from redux is immutable
        this.userPreferences = { ...preferences } as IUserPreferences ?? this.userPreferences;
      });
  }

  ngOnInit() {
    this.userPreferenceService.getEmailFrequencyOptions().then(options => this.availableEmailFrequencyOptions = options);
  }

  saveEmailPreferences() {
    if (!this.userPreferences) {
      return;
    }

    this.userPreferenceService.saveUserPreference(this.userPreferences)
      .then((response: IUserPreferencesResponse) => {
        this.store.dispatch(new ReceiveUserPreferences(response));
      });
  }
}
