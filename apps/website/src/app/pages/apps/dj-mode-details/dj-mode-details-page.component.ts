import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AudioFeaturesObject, ListOfUsersPlaylistsResponse, TrackObjectFull} from "@spotify-manager/core";
import {ApiService} from "../../../services/api/api.service";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dj-mode-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dj-mode-details-page.component.html',
  styleUrl: './dj-mode-details-page.component.scss',
})
export class DjModeDetailsPageComponent implements OnInit{
  playlistId = '';
  userplaylists: ListOfUsersPlaylistsResponse | undefined;
  private sortedPlaylist: { track: TrackObjectFull, audioFeatures: AudioFeaturesObject, score: number }[] = [];

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.playlistId = params.get('playlistId') || '';
      this.getPlaylists();
    });
  }

  getPlaylists(): void {
    this.apiService.getAllUserPlaylists().then(userplaylists => {
      userplaylists.items.sort((a, b) => a.name.localeCompare(b.name));
      this.userplaylists = userplaylists;
    });
  }

  getSuggestedSorting(): void {
    this.apiService.djModePlaylist(this.playlistId).then(sortedPlaylist => {
      this.sortedPlaylist = sortedPlaylist as { track: TrackObjectFull, audioFeatures: AudioFeaturesObject, score: number }[];
      const nameUriPairs = this.sortedPlaylist.map(x => ({name: x.track.name, uri: x.track.uri, score: x.score}));
      console.log(nameUriPairs);

      // log any duplicates names
      const duplicates = nameUriPairs.filter((x, i) => nameUriPairs.slice(i + 1).some(y => y.name === x.name));
      console.log('Duplicates:', duplicates);
    });
  }

  applySuggestedSorting(): void {
    this.apiService.applySorting(this.playlistId, this.sortedPlaylist.map(x => x.track.uri)).then(() => {
      console.log('Playlist reordered successfully');
    });
  }
}
