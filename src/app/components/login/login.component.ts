import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import {SpotifyAuthenticationService} from '../../services/spotifyAuthentication/spotify-authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authenticationUrl: string;
  spotify = faSpotify;

  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
    this.authenticationUrl = spotifyAuth.authenticationURL;
  }

  ngOnInit(): void {
  }

}
