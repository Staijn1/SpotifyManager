import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccountComponent } from './pages/account/account.component';
import { AuthorizeComponent } from './pages/authorize/authorize.component';
import { LoginComponent } from './pages/login/login.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ForkSyncComponent } from './pages/fork-sync/fork-sync.component';
import { ErrorComponent } from './components/error/error.component';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './main/navbar/navbar.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { BoxComponent } from './components/box/box.component';
import { InnerPageComponent } from './main/inner-page/inner-page.component';
import { ForkComponent } from './pages/fork/fork.component';
import { PlaylistOverviewComponent } from './components/playlist-overview/playlist-overview.component';
import { PlaylistComparePageComponent } from './pages/playlist-compare-page/playlist-compare-page.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AuthorizeComponent,
    NavbarComponent,
    HomeComponent,
    InnerPageComponent,
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
  ],
  imports: [BrowserModule, AppRoutingModule, FontAwesomeModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
