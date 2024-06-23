import { Component, OnDestroy, OnInit } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faGears } from '@fortawesome/free-solid-svg-icons';

import {
  ArtistObjectFull,
  CurrentUsersProfileResponse,
  TimeRange,
  TrackObjectFull,
  UsersTopArtistsResponse,
  UsersTopTracksResponse
} from '@spotify-manager/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidGears } from '@ng-icons/font-awesome/solid';
import { SpotifyTrackComponent } from '../../../components/spotify-track/spotify-track.component';
import { SpotifyArtistComponent } from '../../../components/spotify-artist/spotify-artist.component';
import { JsonPipe, NgIf } from '@angular/common';
import { SpotifyUserComponent } from '../../../components/spotify-user/spotify-user.component';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { SpotifyAPIService } from '../../../services/spotifyAPI/spotify-api.service';
import { SpotifyManagerUserState } from '../../../types/SpotifyManagerUserState';
import { FormsModule } from '@angular/forms';
import { TopItemsStats } from '../../../redux/top-items/top-items-stats.reducer';
import { UpdateTopArtistTimeRange, UpdateTopTrackTimeRange } from '../../../redux/top-items/top-items-stats.action';

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
    RouterLink,
    NgIcon,
    FormsModule
  ],
  providers: [provideIcons({ faSolidGears })],
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnDestroy {
  // Subject to destroy all subscriptions that have added it to it's pipe()
  private destroy$ = new Subject<void>();
  spotify = faSpotify;
  isLoading = false;
  accountInformation: CurrentUsersProfileResponse | null | undefined = null;


  topTracks: UsersTopTracksResponse | undefined;
  topArtists: UsersTopArtistsResponse | undefined;
  selectedTimeRangeForSongStats: TimeRange = 'medium_term';
  selectedTimeRangeForArtistsStats: TimeRange = 'medium_term';

  /**
   * Inject dependencies
   * @param spotifyAPI
   * @param store
   */
  constructor(
    private readonly spotifyAPI: SpotifyAPIService,
    private readonly store: Store<{
      userState: SpotifyManagerUserState,
      topItemsStats: TopItemsStats
    }>
  ) {
    this.store.select('userState')
      .pipe(map(state => state.user), takeUntil(this.destroy$)).subscribe(user => {
      this.accountInformation = user;
    });

    // Only load top tracks when the time range for it has changed
    this.store.select('topItemsStats')
      .pipe(map(state => state.topTracksTimeRange), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(timeRange => {
        // this.selectedTimeRangeForSongStats = timeRange;
        this.loadTopItems('tracks', timeRange)
          .then(topTracks => {
            this.topTracks = topTracks as SpotifyApi.UsersTopTracksResponse;
          });
      });

    // Only load top artists when the time range for it has changed
    this.store.select('topItemsStats')
      .pipe(map(state => state.topArtistsTimeRange), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(timeRange => {
        this.selectedTimeRangeForArtistsStats = timeRange;
        this.loadTopItems('artists', timeRange)
          .then(topArtists => {
            this.topArtists = topArtists as SpotifyApi.UsersTopArtistsResponse;
          });
      });
  }

  get topArtistsList(): ArtistObjectFull[] {
    return this.topArtists?.items ?? [];
  }

  get topTracksList(): TrackObjectFull[] {
    return this.topTracks?.items ?? [];
  }

  onTimeRangeChangedForTracks() {
    this.store.dispatch(new UpdateTopTrackTimeRange(this.selectedTimeRangeForSongStats));
  }

  onTimeRangeChangedForArtists() {
    this.store.dispatch(new UpdateTopArtistTimeRange(this.selectedTimeRangeForArtistsStats));
  }

  private async loadTopItems(itemType: 'tracks' | 'artists', timeRange: TimeRange) {
    this.isLoading = true;
    const loader = (itemType === 'tracks' ? this.spotifyAPI.getTopTracks : this.spotifyAPI.getTopArtists).bind(this.spotifyAPI);

    const retval = await loader(timeRange);
    this.isLoading = false;
    return retval;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
