import {Component, OnInit} from '@angular/core';
import {SpotifyAuthenticationService} from '../../services/spotifyAuthentication/spotify-authentication.service';
import {routes} from '../../app-routing.module';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  readonly routes = routes;

  constructor(private readonly spotifyAuth: SpotifyAuthenticationService) {
  }

  ngOnInit(): void {
  }

  isLoggedIn(): boolean {
    return this.spotifyAuth.isLoggedIn();
  }

  logOut(): void {
    this.spotifyAuth.logOut();
  }
}
