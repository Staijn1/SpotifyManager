import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AuthorizeComponent } from './components/authorize/authorize.component';
import { NavbarComponent } from './main/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { HomeComponent } from './main/home/home.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FooterComponent } from './main/footer/footer.component';
import { InnerPageComponent } from './main/inner-page/inner-page.component';
import { OverviewComponent } from './components/overview/overview.component';
import { AccountComponent } from './components/account/account.component';
import { SubnavComponent } from './main/subnav/subnav.component';
import { PlaylistComponent } from './components/playlist/playlist.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AuthorizeComponent,
    NavbarComponent,
    HeroComponent,
    HomeComponent,
    FooterComponent,
    InnerPageComponent,
    OverviewComponent,
    AccountComponent,
    SubnavComponent,
    PlaylistComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
