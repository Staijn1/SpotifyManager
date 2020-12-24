import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import {faSpinner, faUserCircle} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  isLoading: boolean;
  accountInformation: SpotifyApi.CurrentUsersProfileResponse;
  topArtists: SpotifyApi.UsersTopArtistsResponse;

  username = faUserCircle;
  spotify = faSpotify;
  loading = faSpinner;
  error: CustomError;

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  ngOnInit(): void {
    this.getCurrentAccount();
    this.getStatistics();
  }

  getCurrentAccount(): void {
    this.isLoading = true;
    this.spotifyAPI.getCurrentAccount().then(data => {
      this.accountInformation = data;
      this.isLoading = false;
      sessionStorage.setItem('userId', data.id);
    }).catch(err => {
      this.isLoading = false;
      this.error = JSON.parse(err.response).error as CustomError;
    });
  }

  getStatistics(): void {
    // todo show these statistics, there is also a parameter for time
    this.isLoading = true;
    this.spotifyAPI.getTopArtists().then(topArtists => {
      this.topArtists = topArtists;
      return this.spotifyAPI.getTopTracks();
    }).then(topTracks => {
    }).catch(err => {
      this.isLoading = false;
      this.error = JSON.parse(err.response).error as CustomError;
    });
  }
}
