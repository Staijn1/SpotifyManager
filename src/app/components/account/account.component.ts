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
  username = faUserCircle;
  spotify = faSpotify;
  loading = faSpinner;
  error: CustomError;
  isLoading: boolean;
  accountInformation: SpotifyApi.CurrentUsersProfileResponse;


  topTracks: SpotifyApi.UsersTopTracksResponse;
  topArtists: SpotifyApi.UsersTopArtistsResponse;

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  ngOnInit(): void {
    this.getInformation();
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
      this.topTracks = topTracks;
    }).catch(err => {
      this.isLoading = false;
      this.error = JSON.parse(err.response).error as CustomError;
    });
  }

  private getInformation(): void {
    this.isLoading = true;
    this.spotifyAPI.getCurrentAccount().then(data => {
      this.accountInformation = data;
      this.isLoading = false;
      sessionStorage.setItem('userId', data.id);
      return this.spotifyAPI.getTopArtists();
    }).then(topArtists => {
      this.topArtists = topArtists;
      return this.spotifyAPI.getTopTracks();
    }).then(topTracks => {
      this.topTracks = topTracks;
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      this.error = JSON.parse(err.response).error as CustomError;
    });
  }
}
