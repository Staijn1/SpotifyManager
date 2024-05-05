import { CanActivateFn, Route, Router } from '@angular/router';
import { GetStartedPageComponent } from './pages/get-started/get-started-page.component';
import { AuthorizePageComponent } from './pages/authorize/authorize-page.component';
import { AccountPageComponent } from './pages/account/account-page.component';
import { inject } from '@angular/core';
import { SpotifyAuthenticationService } from './services/spotify-authentication/spotify-authentication.service';
import { RemixPageComponent } from './pages/remix/remix-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { RemixOverviewPageComponent } from './pages/remix-overview/remix-overview-page.component';
import { SyncRemixedPlaylistPageComponent } from './pages/sync-remixed-playlist/sync-remixed-playlist-page.component';
import { SettingsPageComponent } from './pages/settings/settings-page.component';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';


const RequireLoginGuard: CanActivateFn = (): boolean => {
  const isAllowed = inject(SpotifyAuthenticationService).canActivate();

  if (!isAllowed) {
    const router = inject(Router);
    router.navigate(['/']);
    return false;
  }

  return true;
};

const RequireUserPreferencesSetGuard: CanActivateFn = (): boolean => {
  let userPreferencesSet = false;
  const store = inject(Store);

  // Read the user preferences from the redux store once to check if we have user preferences
  store.select('userState').pipe(take(1)).subscribe(state => {
    userPreferencesSet = state.userPreferences !== null;
  });

  if (!userPreferencesSet) {
    inject(Router).navigate(['/account/settings']);
  }

  return userPreferencesSet;
};

export const appRoutes: Route[] = [
  { path: '', component: HomePageComponent },
  { path: 'get-started', component: GetStartedPageComponent },
  { path: 'callback', component: AuthorizePageComponent },
  {
    path: 'account',
    children: [
      {
        path: '',
        component: AccountPageComponent,
        canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
      },
      {
        path: 'settings', component: SettingsPageComponent,
        canActivate: [RequireLoginGuard]
      }
    ]
  },
  {
    path: 'remix',
    component: RemixPageComponent,
    canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
  },
  {
    path: 'remix-overview',
    component: RemixOverviewPageComponent,
    canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
  },
  {
    path: 'sync-remixed-playlist',
    component: SyncRemixedPlaylistPageComponent,
    canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
  }
];
