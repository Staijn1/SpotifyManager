import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {AccountComponent} from './pages/account/account.component';
import {AuthorizeComponent} from './pages/authorize/authorize.component';
import {GetStartedComponent} from './pages/login/get-started.component';
import {ForkSyncComponent} from './pages/fork-sync/fork-sync.component';
import {HomeComponent} from './pages/home/home.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
import {ForkComponent} from './pages/fork/fork.component';
import {PlaylistComparePageComponent} from './pages/playlist-compare-page/playlist-compare-page.component';

export type ExtendedRoute = Route & {
  title: string;
  isVisible: boolean;
  requiresLogin: boolean;
  children?: ExtendedRoute[];
};

export const routes: ExtendedRoute[] = [
  {path: '', component: HomeComponent, title: 'Home', isVisible: true, requiresLogin: false},
  {path: 'get-started', component: GetStartedComponent, title: 'Get Started', isVisible: true, requiresLogin: false},
  {path: 'callback', component: AuthorizeComponent, title: '', isVisible: false, requiresLogin: false},
  {path: 'account', component: AccountComponent, title: 'Account', isVisible: true, requiresLogin: true},
  {
    path: 'playlists', title: 'Playlists', isVisible: true, requiresLogin: true, children: [
      {path: 'fork', component: ForkComponent, title: 'Fork playlists', isVisible: true, requiresLogin: true},
      {path: 'sync', component: ForkSyncComponent, title: 'Sync playlists', isVisible: true, requiresLogin: true},
      // todo: maybe isVisible true and let the user choose which playlist to compare?
      {
        path: 'compare',
        component: PlaylistComparePageComponent,
        title: 'Compare playlists',
        isVisible: false,
        requiresLogin: true
      },
    ]
  },
  {path: '**', component: PageNotFoundComponent, title: '', isVisible: false, requiresLogin: false},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
