import {Component, OnInit} from '@angular/core';
import {faSpinner, faSync} from '@fortawesome/free-solid-svg-icons';
import {CustomError} from '../../types/CustomError';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';

@Component({
  selector: 'app-fork',
  templateUrl: './fork.component.html',
  styleUrls: ['./fork.component.scss'],
})
export class ForkComponent implements OnInit {
  playlists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  playlistsToMerge: string[] = [];
  playlistName!: string;
  loading = faSpinner;
  isLoading = false;
  refreshIcon = faSync;

  error: CustomError | undefined;

  constructor(private readonly spotifyAPI: SpotifyAPIService, private readonly api: SpotifyAPIService) {
  }

  ngOnInit(): void {
    this.getPlaylists();
  }

  getPlaylists(): void {
    this.isLoading = true;
    this.spotifyAPI.getUserPlaylist({limit: 50}).then(data => {
      this.playlists = data;
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      console.error(err);
    });
  }

  onSubmit(): void {
    this.spotifyAPI.mergePlaylists(this.playlistName, this.playlistsToMerge).then(
      data => {
        console.log('success!');
      }
    ).catch(err => {
      this.error = JSON.parse(err.response).error as CustomError;
    });

  }

  getMorePlaylists(): void {
    this.isLoading = true;
    this.spotifyAPI.getGeneric(this.playlists.next).then(
      data => {
        this.isLoading = false;
        const currentPlaylists = this.playlists.items;
        this.playlists = (data as SpotifyApi.ListOfUsersPlaylistsResponse);
        this.playlists.items = currentPlaylists.concat(this.playlists.items);
      }
    ).catch(err => {
      this.error = JSON.parse(err.response).error as CustomError;
    });
  }
}
