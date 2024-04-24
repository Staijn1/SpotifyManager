import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferenceService } from '../../services/user-preference/user-preference.service';
import { EmailNotificationFrequency, IUserPreferences, IUserPreferencesResponse } from '@spotify-manager/core';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../types/SpotifyManagerUserState';
import { ReceiveUserPreferences } from '../../redux/user-state/user-state.action';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  availableEmailFrequencyOptions: EmailNotificationFrequency[] = [];

  userPreferences: IUserPreferences = {
    originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY
  };

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly store: Store<{ userState: SpotifyManagerUserState }>) {

  }

  ngOnInit() {
    this.userPreferenceService.getEmailFrequencyOptions().then(options => this.availableEmailFrequencyOptions = options);
  }

  saveEmailPreferences() {
    this.userPreferenceService.saveUserPreference(this.userPreferences)
      .then((response: IUserPreferencesResponse) => {
      this.store.dispatch(new ReceiveUserPreferences(response));
    });
  }
}
