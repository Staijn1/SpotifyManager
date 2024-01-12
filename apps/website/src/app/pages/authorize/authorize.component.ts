import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '../../types/Message';
import { SpotifyAuthenticationService } from '../../services/spotify-authentication/spotify-authentication.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { MessageService } from '../../services/message/message.service';

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

  /**
   * Inject dependencies and subscribe to any errors that occur
   * @param spotifyAuth
   * @param router
   * @param messageService
   */
  constructor(private spotifyAuth: SpotifyAuthenticationService, private readonly router: Router, private readonly messageService: MessageService) {
  }

  /**
   * This page completes the login process for spotify
   */
  ngOnInit(): void {
    this.spotifyAuth.completeLogin()
      .then((result) => {
        if (result) {
          this.router.navigate(['account']);
        } else {
          this.messageService.setMessage(new Message('error', 'Something went wrong while logging in'));
        }
      });
  }
}
