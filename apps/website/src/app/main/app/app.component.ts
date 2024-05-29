import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HorizontalNavigationBarComponent } from '../navigation-bar/horizontal-navigation-bar/horizontal-navigation-bar.component';
import { MessageService } from '../../services/message/message.service';
import { ToastComponent } from '../../components/toast/toast.component';
import * as AOS from 'aos';
import { Store } from '@ngrx/store';
import { SpotifyManagerUserState } from '../../types/SpotifyManagerUserState';
import { distinct, map } from 'rxjs';
import { SpotifyAPIService } from '../../services/spotifyAPI/spotify-api.service';
import { ReceiveUserPreferences, SetCurrentLoggedInUser } from '../../redux/user-state/user-state.action';
import { UserPreferenceService } from '../../services/user-preference/user-preference.service';
import { Message } from '../../types/Message';

@Component({
  standalone: true,
  imports: [RouterOutlet, HorizontalNavigationBarComponent, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(
    protected readonly messageService: MessageService,
    private readonly store: Store<{ userState: SpotifyManagerUserState }>,
    private readonly spotifyApi: SpotifyAPIService,
    private readonly userPreferencesService: UserPreferenceService,
    private readonly router: Router
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

    if (userpreferences === null){
      this.messageService.setMessage(new Message('info', 'Unfortunately, you have not set your preferences yet. Please let us know how you would like to use Spotify Manager, before you can continue.'));
      this.router.navigate(['/apps/account/settings']);
    }
  }
}
