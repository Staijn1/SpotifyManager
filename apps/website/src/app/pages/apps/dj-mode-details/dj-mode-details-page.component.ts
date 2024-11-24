import { AfterViewInit, Component, OnInit } from '@angular/core';
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
export class DjModeDetailsPageComponent implements OnInit, AfterViewInit {
  playlistId = '';
  userplaylists: ListOfUsersPlaylistsResponse | undefined;
  private sortedPlaylist: { track: TrackObjectFull, audioFeatures: AudioFeaturesObject, score: number }[] = [];

  originalOrder = [
    { id: 1, name: 'Song A' },
    { id: 2, name: 'Song B' },
    { id: 3, name: 'Song C' }
  ];

  sortedOrder = [
    { id: 2, name: 'Song B' },
    { id: 1, name: 'Song A' },
    { id: 3, name: 'Song C' }
  ];

  svgLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  svgWidth = 500; // Adjust as necessary
  svgHeight = 300; // Adjust as necessary


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

  ngAfterViewInit() {
    this.calculateLines();
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

  calculateLines() {
    const originalList = document.querySelectorAll('[data-index][data-order="original"]');
    const sortedList = document.querySelectorAll('[data-index][data-order="sorted"]');

    if (originalList.length === 0 || sortedList.length === 0) {
      console.error('Elements not found properly');
      return;
    }

    this.svgLines = this.originalOrder.map((song, index) => {
      const originalElement = originalList[index] as HTMLElement;
      const sortedIndex = this.sortedOrder.findIndex((s) => s.id === song.id);
      const sortedElement = sortedList[sortedIndex] as HTMLElement;

      if (originalElement && sortedElement) {
        return {
          x1: 0, // Adjust based on column positioning
          y1: originalElement.offsetTop + 20, // Adjust to center vertically within 40px height
          x2: this.svgWidth, // Adjust based on column positioning
          y2: sortedElement.offsetTop + 20 // Adjust to center vertically within 40px height
        };
      } else {
        console.warn(`Element not found for song ID: ${song.id}`);
        return { x1: 0, y1: 0, x2: 0, y2: 0 };
      }
    });
  }
}
