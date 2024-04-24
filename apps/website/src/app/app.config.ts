import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { userPreferencesReducer } from './redux/user-preferences/user-preferences.reducer';
import { userStateReducer } from './redux/user-state/user-state.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    provideAnimations(),
    provideOAuthClient(),
    provideStore({
      userPreferences: userPreferencesReducer,
      userState: userStateReducer,
    }),
    provideStoreDevtools(),
  ],
};
