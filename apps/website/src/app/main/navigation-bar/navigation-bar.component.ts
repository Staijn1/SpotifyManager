import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SpotifyAuthenticationService } from '../../services/spotify-authentication/spotify-authentication.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    FaIconComponent
  ],
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss',
})
export class NavigationBarComponent {
  hamburgerMenuIcon = faBars;
  constructor(protected readonly spotifyAuthService: SpotifyAuthenticationService) {}
}
