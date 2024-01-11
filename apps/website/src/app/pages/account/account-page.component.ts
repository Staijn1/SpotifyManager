import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import {faSpinner, faUserCircle} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {Message} from '../../types/Message';
import { CurrentUsersProfileResponse, UsersTopArtistsResponse, UsersTopTracksResponse } from '@spotify-manager/core';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-account',
  templateUrl: './account-page.component.html',
  standalone: true,
  imports: [
    NgIf
  ],
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit {
  username = faUserCircle;
  spotify = faSpotify;
  loading = faSpinner;
  error: Message | undefined;
  isLoading = false;
  accountInformation!: CurrentUsersProfileResponse;


  topTracks!: UsersTopTracksResponse;
  topArtists!: UsersTopArtistsResponse;

  /**
   * Inject dependencies
   * @param {SpotifyAPIService} spotifyAPI
   */
  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  /**
   * On page load, get all data
   */
  ngOnInit(): void {
    this.getInformation();
  }

  /**
   * Get the information this page needs, like the account info, top artists and top songs
   * @private
   */
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
      this.error = JSON.parse(err.response).error as Message;
    });
  }


  /**
   * Genres received from the spotify API need to be formatted
   * Returns a string like | Edm | Gauze pop |
   * @param {string[]} genresArray
   * @returns {string}
   */
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

  /**
   * Capitalizes the first letter of a string
   * @param {string} input
   * @returns {string}
   * @private
   */
  private capitalizeFirstLetter(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
}
