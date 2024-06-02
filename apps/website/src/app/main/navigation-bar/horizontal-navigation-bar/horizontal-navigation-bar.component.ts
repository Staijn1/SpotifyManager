import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SpotifyAuthenticationService } from '../../../services/spotify-authentication/spotify-authentication.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars, faGears, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    FaIconComponent
  ],
  selector: 'app-navigation-bar',
  templateUrl: './horizontal-navigation-bar.component.html',
  styleUrl: './horizontal-navigation-bar.component.scss',
})
export class HorizontalNavigationBarComponent {
  @ViewChild('navbar') navbar!: ElementRef<HTMLElement>
  readonly hamburgerMenuIcon = faBars;
  readonly accountIcon = faUser;
  readonly settingsIcon = faGears;

  constructor(protected readonly spotifyAuthService: SpotifyAuthenticationService) {}

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrolledClasses = ['z-20', 'border-b', 'border-base-content/10', 'bg-base-100', 'lg:bg-opacity-90', 'dark:lg:bg-opacity-95'];
    const notScrolledClasses = ['z-[60]', 'transition-all', 'duration-500', 'border-transparent'];

    if (window.scrollY > 20) {
      this.navbar.nativeElement.classList.remove(...notScrolledClasses);
      this.navbar.nativeElement.classList.add(...scrolledClasses);
    } else {
      this.navbar.nativeElement.classList.remove(...scrolledClasses);
      this.navbar.nativeElement.classList.add(...notScrolledClasses);
    }
  }
}
