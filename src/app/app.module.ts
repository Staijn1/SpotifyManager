import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AccountComponent} from './components/account/account.component';
import {AuthorizeComponent} from './components/authorize/authorize.component';
import {HeroComponent} from './components/hero/hero.component';
import {LoginComponent} from './components/login/login.component';
import {OverviewComponent} from './components/overview/overview.component';
import {MergeComponent} from './components/merge/merge.component';
import {ErrorComponent} from './main/error/error.component';
import {FooterComponent} from './main/footer/footer.component';
import {HomeComponent} from './main/home/home.component';
import {InnerPageComponent} from './main/inner-page/inner-page.component';
import {NavbarComponent} from './main/navbar/navbar.component';
import {PageNotFoundComponent} from './main/page-not-found/page-not-found.component';
import {SubnavComponent} from './main/subnav/subnav.component';
import {AvatarComponent} from './widgets/avatar/avatar.component';
import { BoxComponent } from './widgets/box/box.component';
import { CompareSelectComponent } from './components/compare-select/compare-select.component';

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
    MergeComponent,
    PageNotFoundComponent,
    ErrorComponent,
    AvatarComponent,
    BoxComponent,
    CompareSelectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
