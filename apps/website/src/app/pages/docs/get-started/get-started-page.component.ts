import { Component, OnInit } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { SpotifyAuthenticationService } from '../../../services/spotify-authentication/spotify-authentication.service';
import { TabsComponent } from '../../../components/tab-component/tabs.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './get-started-page.component.html',
  imports: [
    TabsComponent,
  ],
  styleUrls: ['./get-started-page.component.scss']
})
export class GetStartedPageComponent implements OnInit {
  readonly playlistEvolutionGraph = `
  %%{
    init: {
        'theme': 'base',
        'gitGraph': {
            'showBranches': true,
            'showCommitLabel':true,
            'mainBranchName': 'Original Playlist'
        }
    }
}%%
gitGraph
    commit id: "Song A added"
    commit id: "Song B deleted"

    branch "Remixed Playlist"
    commit id: "Add Personal Song"

    checkout "Original Playlist"
    commit id: "Song C Added"

    checkout "Remixed Playlist"
    commit id: "Remove song A from Original playlist" type: HIGHLIGHT


    checkout "Original Playlist"
    commit id: "Song D Added" type: HIGHLIGHT

    checkout "Remixed Playlist"
    merge "Original Playlist" tag:"Sync Result"

    commit id: "..."

    checkout "Original Playlist"
    commit id: ".."
  `;
  readonly spotify = faSpotify;
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
