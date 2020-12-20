import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import {faUserCircle, faUserFriends} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  accountInformation: SpotifyApi.CurrentUsersProfileResponse;
  username = faUserCircle;
  followers = faUserFriends;
  spotify = faSpotify;

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  ngOnInit(): void {
    this.getCurrentAccount();
  }

  getCurrentAccount(): void {
    this.spotifyAPI.getCurrentAccount().then(data => {
      this.accountInformation = data;
    }).catch(err => {
      console.error(err);
    });
  }
}
