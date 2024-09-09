import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApiService} from "../../../services/api/api.service";
import {AudioFeaturesObject, ListOfUsersPlaylistsResponse, TrackObjectFull} from "@spotify-manager/core";
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
  private sortedPlaylist: { track: TrackObjectFull, audioFeatures: AudioFeaturesObject, score: number }[] = [];

  constructor(private readonly apiService: ApiService) {
  }

  ngOnInit(): void {
    this.apiService.getAllUserPlaylists().then(userplaylists => {
      userplaylists.items.sort((a, b) => a.name.localeCompare(b.name))
      this.userplaylists = userplaylists;
    });
  }

  getSuggestedSorting() {
    this.apiService.djModePlaylist(this.playlistId).then(sortedPlaylist => {
      this.sortedPlaylist = sortedPlaylist as { track: TrackObjectFull, audioFeatures: AudioFeaturesObject, score: number }[];
      const nameUriPairs = this.sortedPlaylist.map(x => ({name: x.track.name, uri: x.track.uri, score: x.score}));
      console.log(nameUriPairs)

      // log any duplicates names
      const duplicates = nameUriPairs.filter((x, i) => nameUriPairs.slice(i + 1).some(y => y.name === x.name));
      console.log('Duplicates:', duplicates);
    })
  }

  applySuggestedSorting() {



    this.apiService.applySorting(this.playlistId, this.sortedPlaylist.map(x => x.track.uri)).then(() => {
      console.log('Playlist reordered successfully');
    })
  }
}
