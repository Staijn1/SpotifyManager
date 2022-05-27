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

  constructor(private spotifyAuth: SpotifyAuthenticationService, private readonly router: Router) {
    this.spotifyAuth.errorEvent.subscribe(error => {
      this.error = error;
    });
  }

  ngOnInit(): void {
    this.spotifyAuth.completeLogin().then(
      data => {
        if (!this.error) {
          this.router.navigate(['overview']).then();
        }
      }
    );
  }

  authorize(): void {
    // this.spotifyAuth.authorize(this._code, this._state);
  }
}
