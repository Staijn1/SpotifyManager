import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '../../types/Message';
import { SpotifyAuthenticationService } from '../../services/spotify-authentication/spotify-authentication.service';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-authorize',
  standalone: true,
  templateUrl: './authorize.component.html',
  imports: [
    ToastComponent
  ],
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit {
  error!: Message;

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
      .then(() => this.router.navigate(['account']))
      .catch((err) => this.error = err);
  }
}
