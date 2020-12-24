import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AccountComponent} from './components/account/account.component';
import {AuthorizeComponent} from './components/authorize/authorize.component';
import {LoginComponent} from './components/login/login.component';
import {OverviewComponent} from './components/overview/overview.component';
import {PlaylistComponent} from './components/playlist/playlist.component';
import {HomeComponent} from './main/home/home.component';
import {PageNotFoundComponent} from './main/page-not-found/page-not-found.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'callback', component: AuthorizeComponent},
  {
    path: 'overview', component: OverviewComponent,
    children: [
      {path: '', redirectTo: 'account', pathMatch: 'full'},
      {path: 'account', component: AccountComponent},
      {path: 'playlist', component: PlaylistComponent}
    ]
  },
  {path: '**', component: PageNotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
