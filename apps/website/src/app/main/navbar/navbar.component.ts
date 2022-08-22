import {Component} from '@angular/core';
import {SpotifyAuthenticationService} from '../../services/spotifyAuthentication/spotify-authentication.service';
import {routes} from '../../app-routing.module';
import {faBars} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  readonly routes = routes;
  hamburgerIcon = faBars;
  public isMenuCollapsed = true;
  /**
   * Inject dependencies
   * @param {SpotifyAuthenticationService} spotifyAuth
   */
  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
  }

  /**
   * Check if this user is logged in
   * @returns {boolean}
   */
  isLoggedIn(): boolean {
    return this.spotifyAuth.isLoggedIn();
  }
}
