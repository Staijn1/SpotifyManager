import {Component, OnInit} from '@angular/core';
import {faSpotify} from '@fortawesome/free-brands-svg-icons';
import { SpotifyAuthenticationService } from '../../../services/spotify-authentication/spotify-authentication.service';
import { TabsComponent } from '../../../components/tab-component/tabs.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './get-started.component.html',
  imports: [
    TabsComponent
  ],
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent implements OnInit {
  spotify = faSpotify;
  authUrl!: string;
  isLoading = false;

  /**
   * Inject spotify Auth service since we are logging in
   * @param spotifyAuth
   */
  constructor(readonly spotifyAuth: SpotifyAuthenticationService) {
  }

  /**
   * Initialize this component by generating the URL where the user can log into spotify
   */
  ngOnInit(): void {
    this.isLoading = true;
  }

  /**
   * Redirect to the login page of Spotify, to the URL created during initialization
   */
  login(): void {
    this.spotifyAuth.initializeAuthorizitionFlow();
  }
}
