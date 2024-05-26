import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferenceService } from '../../services/user-preference/user-preference.service';
import {
  EmailNotificationFrequency,
  IUserPreferences,
  IUserPreferencesResponse,
  ListOfUsersPlaylistsResponse
} from '@spotify-manager/core';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../types/SpotifyManagerUserState';
import { ReceiveUserPreferences } from '../../redux/user-state/user-state.action';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faInfoCircle, faSave } from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent, NgOptimizedImage],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  readonly informationIcon = faInfoCircle;
  readonly saveIcon = faSave;
  remixes: SpotifyApi.ListOfUsersPlaylistsResponse | undefined;
  availableEmailFrequencyOptions: EmailNotificationFrequency[] = [];

  // Defaults for when the user first logs in and has no preferences
  userPreferences: IUserPreferences = {
    originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.WEEKLY,
    excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications: []
  };
  hasUserPreferencesSet = false;
  protected isInitializing = true;
  private isLoading = true;

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly api: ApiService,
    private readonly store: Store<{ userState: SpotifyManagerUserState }>) {
    this.store.select('userState')
      .pipe(map(state => state.userPreferences))
      .subscribe(preferences => {
        this.hasUserPreferencesSet = preferences !== null;

        // If the user logs in and has no preferences, the defaults will be used otherwise the user's preferences will be used
        // Create a copy of the preferences because the object from redux is immutable
        this.userPreferences = preferences == null ? this.userPreferences : JSON.parse(JSON.stringify(preferences));
      });
  }

  ngOnInit() {
    this.userPreferenceService.getEmailFrequencyOptions()
      .then(options => this.availableEmailFrequencyOptions = options)
      .finally(() => this.isInitializing = false)

    this.getRemixedPlaylists();
  }

  /**
   * Get the remixed playlists for this user
   */
  getRemixedPlaylists(): void {
    this.isLoading = true;
    this.api.getMyRemixedPlaylists()
      .then(data => this.remixes = data as ListOfUsersPlaylistsResponse)
      .finally(() => this.isLoading = false);
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

  /**
   * Check if the notification is enabled for the remix id
   * Returns true if the remix id is not in the excluded list in the user preferences
   * @param remixId
   */
  isNotificationEnabled(remixId: string): boolean {
    if (!this.userPreferences) return false;
    return !this.userPreferences.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications.includes(remixId);
  }

  toggleNotification(remixId: string, htmlElement: EventTarget | null): void {
    const isChecked = (htmlElement as HTMLInputElement).checked;
    if (isChecked) {
      // If the checkbox is enabled, remove the remix id from the excluded list
      this.userPreferences.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications =
        this.userPreferences.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications.filter(id => id !== remixId);
    } else {
      // If the checkbox is disabled, add the remix id to the excluded list
      this.userPreferences.excludedPlaylistIdsFromOriginalPlaylistUpdatedNotifications.push(remixId);
    }
  }

  getLabelTextForSwitch(remixId: string) {
    return this.isNotificationEnabled(remixId) ? 'Enabled' : 'Disabled';
  }
}
