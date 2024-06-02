import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Message } from '../../types/Message';
import { SpotifyAuthenticationService } from '../../services/spotify-authentication/spotify-authentication.service';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-authorize',
  standalone: true,
  templateUrl: './authorize-page.component.html',
  imports: [
    ToastComponent,
    RouterLink
  ],
  styleUrls: ['./authorize-page.component.scss']
})
export class AuthorizePageComponent implements OnInit {

  /**
   * Inject dependencies and subscribe to any errors that occur
   * @param spotifyAuth
   * @param router
   */
  constructor(private spotifyAuth: SpotifyAuthenticationService, private readonly router: Router) {
  }

  /**
   * This page completes the login process for spotify
   */
  ngOnInit(): void {
    this.spotifyAuth.completeLogin()
      .then((isSuccessful) => {
        if (isSuccessful) {
          this.router.navigate(['apps']);
        } else {
          throw new Message("error", "Something went wrong while logging in");
        }
      });
  }
}
