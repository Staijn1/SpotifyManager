import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './main/app/app.component';
import { AccountComponent } from './pages/account/account.component';
import { AuthorizeComponent } from './pages/authorize/authorize.component';
import { GetStartedComponent } from './pages/get-started/get-started.component';
import { RemixSyncComponent } from './pages/remix-sync/remix-sync.component';
import { ErrorComponent } from './components/error/error.component';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './main/navbar/navbar.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { BoxComponent } from './components/box/box.component';
import { RemixComponent } from './pages/remix/remix.component';
import { PlaylistOverviewComponent } from './components/playlist-overview/playlist-overview.component';
import { PlaylistComparePageComponent } from './pages/playlist-compare-page/playlist-compare-page.component';
import { ModalComponent } from './components/modal/modal.component';
import {
  NgbAlertModule,
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { HeroComponent } from './components/hero/hero.component';
import { ButtonComponent } from './components/button/button.component';
import { IllustrationCardComponent } from './components/illustration-card/illustration-card.component';
import { AudioComponent } from './components/audio/audio.component';

@NgModule({
  declarations: [
    AppComponent,
    GetStartedComponent,
    AuthorizeComponent,
    NavbarComponent,
    HomeComponent,
    AccountComponent,
    RemixSyncComponent,
    PageNotFoundComponent,
    ErrorComponent,
    AvatarComponent,
    BoxComponent,
    RemixComponent,
    PlaylistOverviewComponent,
    PlaylistComparePageComponent,
    ModalComponent,
    HeroComponent,
    ButtonComponent,
    IllustrationCardComponent,
    AudioComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbAlertModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
