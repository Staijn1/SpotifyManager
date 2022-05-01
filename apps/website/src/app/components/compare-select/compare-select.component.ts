import {Component, OnInit} from '@angular/core';
import {faSpinner, faSync} from '@fortawesome/free-solid-svg-icons';
import {SpotifyAPIService} from '../../services/spotifyAPI/spotify-api.service';
import {CustomError} from '../../types/CustomError';

@Component({
  selector: 'app-compare-select',
  templateUrl: './compare-select.component.html',
  styleUrls: ['./compare-select.component.scss']
})
export class CompareSelectComponent implements OnInit {
  playlists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  playlistToCompare: string[] = [];
  loading = faSpinner;
  isLoading = false;
  refreshIcon = faSync;

  error: CustomError | undefined;

  tracksInPlaylistOne: any;
  tracksInPlaylistTwo: any;

  constructor(private readonly spotifyAPI: SpotifyAPIService) {
  }

  ngOnInit(): void {
    this.getPlaylist();
  }

  registerPlaylist(id: string, event: Event): void {
    throw new Error('Method not implemented.');
    /*  if (this.playlistToCompare.length < 2) {
        const iconbox = $((event as any).target.offsetParent.offsetParent.offsetParent);
        const index = this.playlistToCompare.findIndex(element => element === id);
        if (index >= 0) {
          this.playlistToCompare.splice(index, 1);
          iconbox.removeClass('selected');
        } else {
          this.playlistToCompare.push(id);
          iconbox.addClass('selected');
        }
      }*/
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

  onSubmit(el: HTMLElement): void {
    if (this.playlistToCompare.length !== 2) {
      this.error = {
        code: '', message: 'Please select two playlists!'

      };
      return;
    }
    el.scrollIntoView();

    this.spotifyAPI.getAllTracksInPlaylist(this.playlistToCompare[0], {limit: 50}).then(tracksInPlaylist => {
      console.log(tracksInPlaylist);
      for (const trackIdSet of tracksInPlaylist) {
        this.spotifyAPI.getSeveralTracks(trackIdSet).then(tracks => {
          console.log(tracks);
        });
      }
    });
    // this.spotifyAPI.getAllTracksInPlaylist(this.playlistToCompare[1]).then(tracks => {
    //   this.tracksInPlaylistTwo = tracks;
    // });
  }
}
