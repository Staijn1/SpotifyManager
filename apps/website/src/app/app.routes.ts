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


const AuthGuard: CanActivateFn = (): boolean => {
  const isAllowed = inject(SpotifyAuthenticationService).canActivate();

  if (!isAllowed) {
    const router = inject(Router);
    router.navigate(['/']);
    return false;
  }

  return true;
};


export const appRoutes: Route[] = [
  { path: '', component: HomePageComponent },
  { path: 'get-started', component: GetStartedPageComponent },
  { path: 'callback', component: AuthorizePageComponent },
  {
    path: 'account',
    children: [
      { path: '', component: AccountPageComponent },
      { path: 'settings', component: SettingsPageComponent }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'remix',
    component: RemixPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'remix-overview',
    component: RemixOverviewPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sync-remixed-playlist',
    component: SyncRemixedPlaylistPageComponent,
    canActivate: [AuthGuard]
  }
];
