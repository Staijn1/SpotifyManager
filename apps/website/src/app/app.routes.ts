import { CanActivateFn, Route } from '@angular/router';
import { GetStartedComponent } from './pages/get-started/get-started.component';
import { AuthorizeComponent } from './pages/authorize/authorize.component';
import { AccountPageComponent } from './pages/account/account-page.component';
import { inject } from '@angular/core';
import { SpotifyAuthenticationService } from './services/spotify-authentication/spotify-authentication.service';
import { RemixPageComponent } from './pages/remix/remix-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { RemixOverviewPageComponent } from './pages/remix-overview/remix-overview-page.component';


const AuthGuard: CanActivateFn = (): boolean => {
  return inject(SpotifyAuthenticationService).canActivate();
}


export const appRoutes: Route[] = [
  { path: '', component: HomePageComponent },
  { path: 'get-started', component: GetStartedComponent },
  { path: 'callback', component: AuthorizeComponent },
  {
    path: 'account',
    component: AccountPageComponent,
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
  }
];
