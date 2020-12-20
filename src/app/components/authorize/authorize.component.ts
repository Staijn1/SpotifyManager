import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit {
  private _code: string;

  constructor(private spotifyAPI: SpotifyAPIService, private readonly route: ActivatedRoute) {


  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this._code = params.code;
    });
    this.authorize();
  }

  authorize(): void {
    this.spotifyAPI.authorize(this._code);
  }
}
