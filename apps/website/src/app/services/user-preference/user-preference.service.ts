import { Injectable } from '@angular/core';
import { HTTPService } from '../http/http-service.service';
import { EmailNotificationFrequency, IUserPreferencesRequest, IUserPreferencesResponse } from '@spotify-manager/core';
import { SpotifyAuthenticationService } from '../spotify-authentication/spotify-authentication.service';
import { MessageService } from '../message/message.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService extends HTTPService {
  constructor(messageService: MessageService, protected readonly spotifyAuth: SpotifyAuthenticationService) {
    super(messageService);
  }

  async saveUserPreference(userPreferencesRequest: IUserPreferencesRequest): Promise<IUserPreferencesResponse> {
    const accessToken = this.spotifyAuth.getAccessToken();
    return this.request(`${environment.apiURL}/user-preferences`, {
      method: 'PUT',
      body: JSON.stringify(userPreferencesRequest),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }


  async getEmailFrequencyOptions(): Promise<EmailNotificationFrequency[]> {
    const accessToken = this.spotifyAuth.getAccessToken();
    return this.request(`${environment.apiURL}/user-preferences/email-frequencies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  async getUserPreferences(): Promise<IUserPreferencesResponse> {
    const accessToken = this.spotifyAuth.getAccessToken();
    return this.request(`${environment.apiURL}/user-preferences/?accessToken=${accessToken}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
}
