import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import {faSpinner, faUserCircle} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';
import * as $ from 'jquery';

import Isotope from 'isotope-layout';

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

    setTimeout(() => {

    }, 5000);
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

      setTimeout(() => this.initGrid(), 750);
    }).catch(err => {
      this.isLoading = false;
      this.error = JSON.parse(err.response).error as CustomError;
    });
  }

  private initGrid(): void {
    const portfolioIsotope = $('.content-container').isotope({
      itemSelector: '.content-item',
      filter: '.filter-artist'
    });

    $('#portfolio-filters li').on('click', filter);

    function filter(): void {
      $('#portfolio-filters li').removeClass('filter-active');
      $(this).addClass('filter-active');
      portfolioIsotope.isotope({
        filter: $(this).data('filter')
      });
    }
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
    // return input;
  }
}
