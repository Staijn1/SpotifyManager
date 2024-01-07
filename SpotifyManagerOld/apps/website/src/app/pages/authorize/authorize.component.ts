import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SpotifyAuthenticationService} from '../../services/spotifyAuthentication/spotify-authentication.service';
import {CustomError} from '../../types/CustomError';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit {
  error!: CustomError;

  /**
   * Inject dependencies and subscribe to any errors that occur
   * @param {SpotifyAuthenticationService} spotifyAuth
   * @param {Router} router
   */
  constructor(private spotifyAuth: SpotifyAuthenticationService, private readonly router: Router) {
    this.spotifyAuth.errorEvent.subscribe(error => {
      this.error = error;
    });
  }

  /**
   * This page completes the login process for spotify
   */
  ngOnInit(): void {
    this.spotifyAuth.completeLogin().then(
      data => {
        if (!this.error) {
          this.router.navigate(['account']).then();
        }
      }
    );
  }
}
