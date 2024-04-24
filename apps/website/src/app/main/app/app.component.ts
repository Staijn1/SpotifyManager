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
import { SetCurrentLoggedInUser } from '../../redux/user-state/user-state.action';

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
    private readonly spotifyApi: SpotifyAPIService
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
      console.log('IsLoggedIn', isLoggedIn);
      if (isLoggedIn) {
        this.loadGlobalUserData().then();
      }
    });
  }

  private async loadGlobalUserData() {
    console.log('Loading global user data');
    const me = await this.spotifyApi.getCurrentAccount();

    this.store.dispatch(new SetCurrentLoggedInUser(me));
  }
}
