import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {SpotifyAuthenticationService} from '../../services/spotifyAuthentication/spotify-authentication.service';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit {
  private _code: string;

  constructor(private spotifyAuth: SpotifyAuthenticationService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this._code = params.code;
    });
    this.authorize();
  }

  authorize(): void {
    this.spotifyAuth.authorize(this._code);
  }
}
