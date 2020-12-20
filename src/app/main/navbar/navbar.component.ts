import {Component, OnInit} from '@angular/core';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  ngOnInit(): void {
  }

  isLoggedIn(): boolean {
    return this.spotifyAPI.isLoggedIn();
  }
}
