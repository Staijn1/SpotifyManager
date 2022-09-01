import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAuthenticationService} from '../../services/spotifyAuthentication/spotify-authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent implements OnInit {
  spotify = faSpotify;
  authUrl!: string;
  isLoading = false;
  loadingIcon = faSpinner;

  /**
   * Inject spotify Auth service since we are logging in
   * @param {SpotifyAuthenticationService} spotifyAuth
   */
  constructor(readonly spotifyAuth: SpotifyAuthenticationService) {
  }

  /**
   * Initialize this component by generating the URL where the user can log into spotify
   */
  ngOnInit(): void {
    this.isLoading = true;
    this.spotifyAuth.generateAuthorizeURL().then(url => {
        this.isLoading = false;
        this.authUrl = url;
      }
    );
  }

  /**
   * Redirect to the login page of Spotify, to the URL created during initialization
   */
  login(): void {
    if (this.authUrl === undefined) {
      return;
    }
    location.href = this.authUrl;
  }
}
