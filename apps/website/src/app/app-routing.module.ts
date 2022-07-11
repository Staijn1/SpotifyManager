import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {AccountComponent} from './pages/account/account.component';
import {AuthorizeComponent} from './pages/authorize/authorize.component';
import {LoginComponent} from './pages/login/login.component';
import {MergeComponent} from './pages/merge/merge.component';
import {OverviewComponent} from './pages/overview/overview.component';
import {HomeComponent} from './pages/home/home.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
import {ForkComponent} from './pages/fork/fork.component';

export type ExtendedRoute = Route & {
  title: string;
  isVisible: boolean;
};

export const routes: ExtendedRoute[] = [
  {path: '', component: HomeComponent, title: 'Home', isVisible: true},
  {path: 'login', component: LoginComponent, title: 'Login', isVisible: true},
  {path: 'callback', component: AuthorizeComponent, title: '', isVisible: false},
  {path: 'overview', component: OverviewComponent, title: 'Overview', isVisible: true},
  {path: 'account', component: AccountComponent, title: 'Account', isVisible: true},
  {path: 'merge', component: MergeComponent, title: 'Merge playlists', isVisible: true},
  {path: 'fork', component: ForkComponent, title: 'Fork playlists', isVisible: true},
  {path: '**', component: PageNotFoundComponent, title: '', isVisible: false},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
