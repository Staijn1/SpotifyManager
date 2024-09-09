import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApiService} from "../../../services/api/api.service";
import {ListOfUsersPlaylistsResponse} from "@spotify-manager/core";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-dj-mode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dj-mode-page.component.html',
  styleUrl: './dj-mode-page.component.scss',
})
export class DjModePageComponent implements OnInit {
  playlistId ='';
  userplaylists: ListOfUsersPlaylistsResponse | undefined;
  fadingTime = 5;

  constructor(private readonly apiService: ApiService) {
  }

  ngOnInit(): void {
    this.apiService.getAllUserPlaylists().then(userplaylists => {
      this.userplaylists = userplaylists;
    });
  }

  getSuggestedSorting() {
    this.apiService.djModePlaylist(this.playlistId, this.fadingTime).then(sortedPlaylist => {
      console.log(sortedPlaylist);
      this.sortedPlaylist = sortedPlaylist;
    }).catch(error => {
      console.error('Error fetching sorted playlist:', error);
    });
  }

  applySuggestedSorting() {
    this.apiService.applySorting(this.playlistId, this.sortedPlaylist).then(() => {
      console.log('Playlist reordered successfully');
    }).catch(error => {
      console.error('Error reordering playlist:', error);
    });
  }
}
