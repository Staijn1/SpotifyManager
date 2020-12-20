import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authenticationUrl: string;
  spotify = faSpotify;

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
    this.authenticationUrl = spotifyAPI.authenticationURL;
  }

  ngOnInit(): void {
  }

}
