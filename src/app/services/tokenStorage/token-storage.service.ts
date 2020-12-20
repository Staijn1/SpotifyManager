import {Injectable} from '@angular/core';
import {SessionType} from '../../types/SessionType';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() {
  }

  writeSession(accessTokenToStore: string, refreshTokenToStore: string): void {
    const now = new Date();
    // Extends current time with an hour
    now.setTime(now.getTime() + 1 * 3600 * 1000);
    const sessionObject: SessionType = {
      expiresAt: now.toLocaleString(),
      accessToken: accessTokenToStore,
      refreshToken: refreshTokenToStore,
    };

    console.log('storing:', sessionObject);
    sessionStorage.setItem('access_token', JSON.stringify(sessionObject));
  }

  getStorage(): SessionType | undefined {
    const retrievedSessionObject = JSON.parse(sessionStorage.getItem('access_token'));

    if (!retrievedSessionObject) {
      return undefined;
    }

    const retrievedDate = new Date(Date.parse(retrievedSessionObject.expiresAt));
    const now = new Date();

    console.log('reading:', retrievedSessionObject);
    if (now.getTime() >= retrievedDate.getTime()) {
      console.log('returning undefined');
      return undefined;
    } else {
      console.log('returning object');
      return retrievedSessionObject;
    }
  }
}
