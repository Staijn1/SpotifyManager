import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HorizontalNavigationBarComponent
} from '../../navigation-bar/horizontal-navigation-bar/horizontal-navigation-bar.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  VerticalNavigationBarComponent
} from '../../navigation-bar/vertical-navigation-bar/vertical-navigation-bar.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssLogOut, cssMenu, cssSearch, cssUser } from '@ng-icons/css.gg';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../../types/SpotifyManagerUserState';
import { CurrentUsersProfileResponse } from '@spotify-manager/core';
import { SpotifyAuthenticationService } from '../../../services/spotify-authentication/spotify-authentication.service';


@Component({
  selector: 'app-logged-in-layout',
  standalone: true,
  imports: [CommonModule, HorizontalNavigationBarComponent, RouterOutlet, VerticalNavigationBarComponent, NgIcon, RouterLink],
  providers: [provideIcons({ cssMenu, cssSearch, cssLogOut, cssUser })],
  templateUrl: './logged-in-layout.component.html',
  styleUrl: './logged-in-layout.component.scss'
})
export class LoggedInLayoutComponent {
  currentUser: CurrentUsersProfileResponse | null | undefined;

  constructor(
    private readonly store: Store<{ userState: SpotifyManagerUserState }>,
    private readonly authService: SpotifyAuthenticationService) {
    this.store.select('userState').subscribe((userState) => {
      this.currentUser = userState.user;
    });
  }

  logout() {
    this.authService.logOut();
  }
}
