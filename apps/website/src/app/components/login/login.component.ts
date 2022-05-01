import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAuthenticationService} from '../../services/spotifyAuthentication/spotify-authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  spotify = faSpotify;
  authUrl!: string;
  isLoading = false;
  loadingIcon = faSpinner;

  constructor(readonly spotifyAuth: SpotifyAuthenticationService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.spotifyAuth.generateAuthorizeURL().then(url => {
        this.isLoading = false;
        this.authUrl = url;
      }
    );
  }

  login(): void {
    if (this.authUrl === undefined) {
      return;
    }
    location.href = this.authUrl;
  }
}
