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
    return this.request(`${environment.apiURL}/user-preferences`, {
      method: 'PUT',
      body: JSON.stringify(userPreferencesRequest),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }


  async getEmailFrequencyOptions(): Promise<EmailNotificationFrequency[]> {
    return this.request(`${environment.apiURL}/user-preferences/email-frequencies`, { method: 'GET' });
  }

  async getUserPreferences(accessToken: string): Promise<IUserPreferencesResponse> {
    return this.request(`${environment.apiURL}/user-preferences/?accessToken=${accessToken}`, { method: 'GET' });
  }
}
