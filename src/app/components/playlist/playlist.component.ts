import {Component, OnInit} from '@angular/core';
import {faSpinner, faSync} from '@fortawesome/free-solid-svg-icons';
import * as $ from 'jquery';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  playlists: SpotifyApi.ListOfUsersPlaylistsResponse;
  playlistsToMerge: string[] = [];
  playlistName: string;
  loading = faSpinner;
  isLoading: boolean;
  refreshIcon = faSync;

  error: CustomError = {
    code: '', message: 'Testing'

  };

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  ngOnInit(): void {
    this.getPlaylist();
  }

  getPlaylist(): void {
    this.isLoading = true;
    this.spotifyAPI.getUserPlaylist({limit: 50}).then(data => {
      this.playlists = data;
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      console.error(err);
    });
  }

  registerPlaylist(id: string, event: Event): void {
    const iconbox = $((event as any).target.offsetParent.offsetParent.offsetParent);
    const index = this.playlistsToMerge.findIndex(element => element === id);
    if (index >= 0) {
      this.playlistsToMerge.splice(index, 1);
      iconbox.removeClass('selected');
    } else {
      this.playlistsToMerge.push(id);
      iconbox.addClass('selected');
    }
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
