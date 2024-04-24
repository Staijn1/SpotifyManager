import { Component, OnInit } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faGears } from '@fortawesome/free-solid-svg-icons';
import { SpotifyAPIService } from '../../services/spotifyAPI/spotify-api.service';
import { JsonPipe, NgIf } from '@angular/common';
import { SpotifyUserComponent } from '../../components/spotify-user/spotify-user.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SpotifyArtistComponent } from '../../components/spotify-artist/spotify-artist.component';
import { SpotifyTrackComponent } from '../../components/spotify-track/spotify-track.component';
import {
  ArtistObjectFull,
  CurrentUsersProfileResponse,
  TrackObjectFull,
  UsersTopArtistsResponse,
  UsersTopTracksResponse
} from '@spotify-manager/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../types/SpotifyManagerUserState';
import { map } from 'rxjs';


@Component({
  selector: 'app-account',
  templateUrl: './account-page.component.html',
  standalone: true,
  imports: [
    NgIf,
    SpotifyUserComponent,
    LoadingComponent,
    JsonPipe,
    SpotifyArtistComponent,
    SpotifyTrackComponent,
    FaIconComponent,
    RouterLink
  ],
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit {
  readonly accountSettingsIcon = faGears;
  spotify = faSpotify;
  isLoading = false;
  accountInformation: CurrentUsersProfileResponse | null = null;


  topTracks: UsersTopTracksResponse | undefined;
  topArtists: UsersTopArtistsResponse | undefined;

  /**
   * Inject dependencies
   * @param spotifyAPI
   * @param store
   */
  constructor(
    private readonly spotifyAPI: SpotifyAPIService,
    private readonly store: Store<{ userState: SpotifyManagerUserState }>
  ) {
    this.store.select('userState')
      .pipe(map(state => state.user))
      .subscribe(user => {
        this.accountInformation = user;
      });
  }

  get topArtistsList(): ArtistObjectFull[] {
    return this.topArtists?.items ?? [];
  }

  get topTracksList(): TrackObjectFull[] {
    return this.topTracks?.items ?? [];
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
    this.spotifyAPI.getTopArtists()
      .then(topArtists => {
        this.topArtists = topArtists;
        return this.spotifyAPI.getTopTracks();
      })
      .then(topTracks => {
        this.topTracks = topTracks;
      }).finally(() => this.isLoading = false);
  }


  /**
   * Genres received from the spotify API need to be formatted
   * Returns a string like | Edm | Gauze pop |
   * @param genresArray
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
   * @param input
   * @private
   */
  private capitalizeFirstLetter(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
}
