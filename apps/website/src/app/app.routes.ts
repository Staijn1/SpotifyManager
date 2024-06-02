import { CanActivateFn, Route, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SpotifyAuthenticationService } from './services/spotify-authentication/spotify-authentication.service';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { RegularLayoutComponent } from './main/layouts/regular/regular-layout.component';
import { SideBarLayoutComponent } from './main/layouts/sidebar/side-bar-layout.component';
import {
  DocumentationNavigationBarComponent
} from './main/navigation-bar/documentation-navigation-bar/documentation-navigation-bar.component';


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
      { path: '', loadComponent: () => import('./pages/home/home-page.component').then(m => m.HomePageComponent) }
    ]
  },
  {
    path: '',
    component: SideBarLayoutComponent,
    children: [
      {
        path: 'callback',
        loadComponent: () => import('./pages/authorize/authorize-page.component').then(m => m.AuthorizePageComponent)
      }
    ]
  },
  {
    path: 'apps',
    component: SideBarLayoutComponent,
    children: [
      { path: '', redirectTo: '/apps/account', pathMatch: 'full' },
      {
        path: '',
        loadComponent: () => import('./main/navigation-bar/logged-in-navigation-bar/logged-in-navigation-bar.component').then(m => m.LoggedInNavigationBarComponent),
        outlet: 'navigation-items'
      },
      {
        path: 'account',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/apps/account/account-page.component').then(m => m.AccountPageComponent),
            canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
          },
          {
            path: 'settings',
            loadComponent: () => import('./pages/apps/settings/settings-page.component').then(m => m.SettingsPageComponent),
            canActivate: [RequireLoginGuard]
          }
        ]
      },
      {
        path: 'remix',
        loadComponent: () => import('./pages/apps/remix/remix-page.component').then(m => m.RemixPageComponent),
        canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
      },
      {
        path: 'remix-overview',
        loadComponent: () => import('./pages/apps/remix-overview/remix-overview-page.component').then(m => m.RemixOverviewPageComponent),
        canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
      },
      {
        path: 'sync-remixed-playlist/:remixedPlaylistId',
        loadComponent: () => import('./pages/apps/sync-remixed-playlist/sync-remixed-playlist-page.component').then(m => m.SyncRemixedPlaylistPageComponent),
        canActivate: [RequireLoginGuard, RequireUserPreferencesSetGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/apps/settings/settings-page.component').then(m => m.SettingsPageComponent),
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
            path: 'overview',
            loadComponent: () => import('./pages/docs/markdown-documentation/markdown-documentation.component').then(m => m.MarkdownDocumentationComponent)
          }
        ]
      },
      {
        path: 'get-started',
        loadComponent: () => import('./pages/docs/markdown-documentation/markdown-documentation.component').then(m => m.MarkdownDocumentationComponent)
      }
    ]
  }
];
