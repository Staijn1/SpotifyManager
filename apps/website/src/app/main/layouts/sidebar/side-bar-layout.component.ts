import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HorizontalNavigationBarComponent
} from '../../navigation-bar/horizontal-navigation-bar/horizontal-navigation-bar.component';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  LoggedInNavigationBarComponent
} from '../../navigation-bar/logged-in-navigation-bar/logged-in-navigation-bar.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssChevronLeft, cssChevronRight, cssLogOut, cssMenu, cssSearch, cssUser } from '@ng-icons/css.gg';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../../types/SpotifyManagerUserState';
import { SpotifyAuthenticationService } from '../../../services/spotify-authentication/spotify-authentication.service';
import { OffCanvasComponent } from '../../../components/offcanvas/off-canvas.component';
import { filter, skip, Subscription } from 'rxjs';
import { faSolidGears } from '@ng-icons/font-awesome/solid';


@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, HorizontalNavigationBarComponent, RouterOutlet, LoggedInNavigationBarComponent, NgIcon, RouterLink, OffCanvasComponent],
  providers: [provideIcons({ cssMenu, cssSearch, cssLogOut, cssUser, cssChevronRight, cssChevronLeft, faSolidGears })],
  templateUrl: './side-bar-layout.component.html',
  styleUrl: './side-bar-layout.component.scss'
})
export class SideBarLayoutComponent implements OnDestroy {
  @ViewChild('toolbar') toolbar!: ElementRef<HTMLElement>;
  @ViewChild(OffCanvasComponent) mobileMenu: OffCanvasComponent | undefined;

  userState!: SpotifyManagerUserState;
  isLeftMenuClosed = false;
  private navigationEndSubscription: Subscription;

  get currentUser() {
    return this.userState.user;
  }

  constructor(
    private readonly store: Store<{ userState: SpotifyManagerUserState }>,
    protected readonly authService: SpotifyAuthenticationService,
    private readonly router: Router) {
    this.store.select('userState').subscribe((userState) => {
      this.userState = userState;
    });

    // Close the mobile menu when the route changes
    this.navigationEndSubscription = this.router.events.pipe(
      skip(1),
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.mobileMenu?.close();
    });
  }

  ngOnDestroy(): void {
    this.navigationEndSubscription.unsubscribe();
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

  toggleMobileMenu() {
    this.mobileMenu?.toggle();
  }
}
