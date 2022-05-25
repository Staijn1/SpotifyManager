import {NgModule} from '@angular/core';
import {Route, RouterModule, Routes} from '@angular/router';
import {AccountComponent} from './components/account/account.component';
import {AuthorizeComponent} from './components/authorize/authorize.component';
import {CompareSelectComponent} from './components/compare-select/compare-select.component';
import {LoginComponent} from './components/login/login.component';
import {MergeComponent} from './components/merge/merge.component';
import {OverviewComponent} from './components/overview/overview.component';
import {HomeComponent} from './main/home/home.component';
import {PageNotFoundComponent} from './main/page-not-found/page-not-found.component';

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
  {path: 'compare', component: CompareSelectComponent, title: 'Compare playlists', isVisible: true},
  {path: '**', component: PageNotFoundComponent, title: '', isVisible: false},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
