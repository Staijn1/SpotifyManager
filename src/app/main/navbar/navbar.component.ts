import {Component, OnInit} from '@angular/core';
import {SpotifyAuthenticationService} from '../../services/spotifyAuthentication/spotify-authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
  }

  ngOnInit(): void {
  }

  isLoggedIn(): boolean {
    return this.spotifyAuth.isLoggedIn();
  }
}
