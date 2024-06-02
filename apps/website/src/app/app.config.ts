import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading, withViewTransitions } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { userStateReducer } from './redux/user-state/user-state.reducer';
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withViewTransitions(), withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideAnimations(),
    provideOAuthClient(),
    provideMarkdown(),
    provideStore({
      userState: userStateReducer,
    }),
    provideStoreDevtools(),
  ],
};
