import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {AccountComponent} from './pages/account/account.component';
import {AuthorizeComponent} from './pages/authorize/authorize.component';
import {LoginComponent} from './pages/login/login.component';
import {ForkSyncComponent} from './pages/fork-sync/fork-sync.component';
import {OverviewComponent} from './pages/overview/overview.component';
import {HomeComponent} from './pages/home/home.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
import {ForkComponent} from './pages/fork/fork.component';
import {PlaylistComparePageComponent} from './pages/playlist-compare-page/playlist-compare-page.component';

export type ExtendedRoute = Route & {
  title: string;
  isVisible: boolean;
  children?: ExtendedRoute[];
};

export const routes: ExtendedRoute[] = [
  {path: '', component: HomeComponent, title: 'Home', isVisible: true},
  {path: 'login', component: LoginComponent, title: 'Login', isVisible: true},
  {path: 'callback', component: AuthorizeComponent, title: '', isVisible: false},
  {path: 'overview', component: OverviewComponent, title: 'Overview', isVisible: true},
  {path: 'account', component: AccountComponent, title: 'Account', isVisible: true},
  {
    path: 'playlists', title: 'not shown', isVisible: false, children: [
      {path: 'fork', component: ForkComponent, title: 'Fork playlists', isVisible: true},
      {path: 'sync', component: ForkSyncComponent, title: 'Sync playlists', isVisible: true},
      // todo: maybe isVisible true and let the user choose which playlist to compare?
      {path: 'compare', component: PlaylistComparePageComponent, title: 'Compare playlists', isVisible: false},
    ]
  },
  {path: '**', component: PageNotFoundComponent, title: '', isVisible: false},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
