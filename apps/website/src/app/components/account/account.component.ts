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
  error: CustomError | undefined;
  isLoading = false;
  accountInformation!: SpotifyApi.CurrentUsersProfileResponse;


  topTracks!: SpotifyApi.UsersTopTracksResponse;
  topArtists!: SpotifyApi.UsersTopArtistsResponse;

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  ngOnInit(): void {
    this.getInformation();
  }

  private getInformation(): void {
    this.isLoading = true;
    this.spotifyAPI.getCurrentAccount().then(data => {
      this.accountInformation = data;
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


  formatGenres(genresArray: string[]): string {
    let genres = '| ';
    if (genresArray.length === 0) {
      genres = '';
    }

    let maxLoopLength;

    if (genresArray.length < 2) {
      maxLoopLength = genresArray.length;
    } else {
      maxLoopLength = 2;
    }

    for (let i = 0; i < maxLoopLength; i++) {
      genres += this.capitalizeFirstLetter(genresArray[i]) + ' | ';
    }

    return genres;
  }

  private capitalizeFirstLetter(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
}
