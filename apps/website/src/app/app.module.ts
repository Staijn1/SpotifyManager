import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AccountComponent} from './pages/account/account.component';
import {AuthorizeComponent} from './pages/authorize/authorize.component';
import {LoginComponent} from './pages/login/login.component';
import {OverviewComponent} from './pages/overview/overview.component';
import {ForkSyncComponent} from './pages/fork-sync/fork-sync.component';
import {ErrorComponent} from './components/error/error.component';
import {HomeComponent} from './pages/home/home.component';
import {NavbarComponent} from './main/navbar/navbar.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
import {AvatarComponent} from './components/avatar/avatar.component';
import {BoxComponent} from './components/box/box.component';
import {ForkComponent} from './pages/fork/fork.component';
import {PlaylistOverviewComponent} from './components/playlist-overview/playlist-overview.component';
import {PlaylistComparePageComponent} from './pages/playlist-compare-page/playlist-compare-page.component';
import {ModalComponent} from './components/modal/modal.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AuthorizeComponent,
    NavbarComponent,
    HomeComponent,
    OverviewComponent,
    AccountComponent,
    ForkSyncComponent,
    PageNotFoundComponent,
    ErrorComponent,
    AvatarComponent,
    BoxComponent,
    ForkComponent,
    PlaylistOverviewComponent,
    PlaylistComparePageComponent,
    ModalComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FontAwesomeModule, FormsModule, NgbCollapseModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
