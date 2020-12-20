import {Component, OnInit} from '@angular/core';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  playlists: SpotifyApi.ListOfUsersPlaylistsResponse;

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  ngOnInit(): void {
    this.getPlaylist();
  }

  getPlaylist(): void {
    this.spotifyAPI.getUserPlaylist({limit: 50}).then(data => {
      this.playlists = data;
      console.log(data);
    }).catch(err => {
      console.error(err);
    });
  }
}
