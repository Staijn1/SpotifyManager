import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HorizontalNavigationBarComponent
} from '../../navigation-bar/horizontal-navigation-bar/horizontal-navigation-bar.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  LoggedInNavigationBarComponent
} from '../../navigation-bar/logged-in-navigation-bar/logged-in-navigation-bar.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssChevronLeft, cssChevronRight, cssLogOut, cssMenu, cssSearch, cssUser } from '@ng-icons/css.gg';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../../types/SpotifyManagerUserState';
import { CurrentUsersProfileResponse } from '@spotify-manager/core';
import { SpotifyAuthenticationService } from '../../../services/spotify-authentication/spotify-authentication.service';


@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, HorizontalNavigationBarComponent, RouterOutlet, LoggedInNavigationBarComponent, NgIcon, RouterLink],
  providers: [provideIcons({ cssMenu, cssSearch, cssLogOut, cssUser, cssChevronRight, cssChevronLeft })],
  templateUrl: './side-bar-layout.component.html',
  styleUrl: './side-bar-layout.component.scss'
})
export class SideBarLayoutComponent {
  @ViewChild('toolbar') toolbar!: ElementRef<HTMLElement>;
  currentUser: CurrentUsersProfileResponse | null | undefined;
  isLeftMenuClosed = false;

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

  toggleLeftMenu() {
    this.isLeftMenuClosed = !this.isLeftMenuClosed;
  }

  onMainContentScroll(currentTarget: EventTarget | null) {
    if (!currentTarget) return;

    const scrolledClasses: string[] = ['border-base-content/10', 'bg-base-100', 'lg:bg-opacity-90', 'dark:lg:bg-opacity-95'];
    const notScrolledClasses: string[] = [];

    if ((currentTarget as HTMLElement).scrollTop > 20) {
      this.toolbar.nativeElement.classList.remove(...notScrolledClasses);
      this.toolbar.nativeElement.classList.add(...scrolledClasses);
    } else {
      this.toolbar.nativeElement.classList.remove(...scrolledClasses);
      this.toolbar.nativeElement.classList.add(...notScrolledClasses);
    }
  }
}
