import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpotifyAuthenticationService } from '../../services/spotify-authentication/spotify-authentication.service';

@Component({
  standalone: true,
  imports: [
    RouterLink
  ],
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss',
})
export class NavigationBarComponent {
  constructor(protected readonly spotifyAuthService: SpotifyAuthenticationService) {}
}
