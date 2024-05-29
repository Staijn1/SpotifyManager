import { CanActivateFn, Route, Router } from '@angular/router';
import { GetStartedPageComponent } from './pages/docs/get-started/get-started-page.component';
import { AuthorizePageComponent } from './pages/authorize/authorize-page.component';
import { inject } from '@angular/core';
import { SpotifyAuthenticationService } from './services/spotify-authentication/spotify-authentication.service';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { RegularLayoutComponent } from './main/layouts/regular/regular-layout.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { SideBarLayoutComponent } from './main/layouts/sidebar/side-bar-layout.component';
import { AccountPageComponent } from './pages/apps/account/account-page.component';
import { SettingsPageComponent } from './pages/apps/settings/settings-page.component';
import { RemixPageComponent } from './pages/apps/remix/remix-page.component';
import { RemixOverviewPageComponent } from './pages/apps/remix-overview/remix-overview-page.component';
import {
  SyncRemixedPlaylistPageComponent
} from './pages/apps/sync-remixed-playlist/sync-remixed-playlist-page.component';
import {
  LoggedInNavigationBarComponent
} from './main/navigation-bar/logged-in-navigation-bar/logged-in-navigation-bar.component';
import {
  DocumentationNavigationBarComponent
} from './main/navigation-bar/documentation-navigation-bar/documentation-navigation-bar.component';
import { MarkdownComponent } from './components/markdown/markdown.component';
import { MarkdownDocumentationComponent } from './pages/docs/markdown-documentation/markdown-documentation.component';


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
  {
    path: '',
    component: RegularLayoutComponent,
    children: [
      { path: '', component: HomePageComponent },
      { path: 'get-started', component: GetStartedPageComponent },
      { path: 'callback', component: AuthorizePageComponent }
    ]
  },
  {
    path: 'apps',
    component: SideBarLayoutComponent,
    children: [
      { path: '', redirectTo: '/apps/account', pathMatch: 'full' },
      { path: '', component: LoggedInNavigationBarComponent, outlet: 'navigation-items' },
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
        path: 'sync-remixed-playlist/:remixedPlaylistId',
        component: SyncRemixedPlaylistPageComponent,
        canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
      },
      {
        path: 'settings',
        component: SettingsPageComponent,
        canActivate: [RequireLoginGuard]
      }
    ]
  },
  {
    path: 'docs',
    component: SideBarLayoutComponent,
    children: [
      { path: '', component: DocumentationNavigationBarComponent, outlet: 'navigation-items' },
      { path: '', pathMatch: 'full', redirectTo: 'get-started' },
      {
        path: 'remix', children: [
          {
            path: '', pathMatch: 'full', redirectTo: 'overview'
          },
          {
            path: 'overview', component: MarkdownDocumentationComponent
          }
        ]
      },
      { path: 'get-started', component: GetStartedPageComponent }
    ]
  }
];
