import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from '../navigation-bar/navigation-bar.component';
import { MessageService } from '../../services/message/message.service';
import { ToastComponent } from '../../components/toast/toast.component';
import * as AOS from 'aos';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../types/SpotifyManagerUserState';
import { distinct, map } from 'rxjs';
import { SpotifyAPIService } from '../../services/spotifyAPI/spotify-api.service';
import { ReceiveUserPreferences, SetCurrentLoggedInUser } from '../../redux/user-state/user-state.action';
import { UserPreferenceService } from '../../services/user-preference/user-preference.service';
import { SpotifyAuthenticationService } from '../../services/spotify-authentication/spotify-authentication.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, NavigationBarComponent, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(
    protected readonly messageService: MessageService,
    private readonly store: Store<{ userState: SpotifyManagerUserState }>,
    private readonly spotifyApi: SpotifyAPIService,
    private readonly userPreferencesService: UserPreferenceService
  ) {
  }

  /**
   * Initialize AOS on page load
   */
  ngOnInit(): void {
    AOS.init();

    this.store.select('userState').pipe(
      map(state => state.isLoggedIn),
      distinct()
    ).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadGlobalUserData().then();
      }
    });
  }

  private async loadGlobalUserData() {
    const me = await this.spotifyApi.getCurrentAccount();
    const userpreferences = await this.userPreferencesService.getUserPreferences();

    this.store.dispatch(new SetCurrentLoggedInUser(me));
    this.store.dispatch(new ReceiveUserPreferences(userpreferences));
  }
}
