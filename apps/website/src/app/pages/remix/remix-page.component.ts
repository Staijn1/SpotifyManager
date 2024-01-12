import { Component, OnInit } from '@angular/core';
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons';
import { SpotifyAPIService } from '../../services/spotifyAPI/spotify-api.service';
import ListOfUsersPlaylistsResponse = SpotifyApi.ListOfUsersPlaylistsResponse;
import { ApiService } from '../../services/api/api.service';
import { LoadingComponent } from '../../components/loading/loading.component';

@Component({
  selector: 'app-remix',
  standalone: true,
  templateUrl: './remix-page.component.html',
  styleUrls: ['./remix-page.component.scss'],
  imports: [
    LoadingComponent
  ]
})
export class RemixPageComponent implements OnInit {
  playlists!: SpotifyApi.ListOfUsersPlaylistsResponse;
  isLoading = false;

  remixIcon = faCompactDisc;

  /**
   * Inject the right dependencies
   * @param spotifyAPI
   * @param api
   */
  constructor(private readonly spotifyAPI: SpotifyAPIService, private readonly api: ApiService) {
  }

  /**
   * On page load, load the necessary data
   */
  ngOnInit(): void {
    this.getPlaylists();
  }

  /**
   * Get the playlists for this user
   */
  getPlaylists(): void {
    this.isLoading = true;
    this.spotifyAPI.getUserPlaylist({limit: 50}).then(data => {
      this.playlists = this.filterPlaylists(data as ListOfUsersPlaylistsResponse);
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      console.error(err);
    });
  }

  /**
   * Get more playlists to show. The spotify API uses paging for playlists. This method gets the next page
   */
  getMorePlaylists(): void {
    this.isLoading = true;
    this.spotifyAPI.getGeneric(this.playlists.next).then(
      data => {
        const currentPlaylists = this.playlists.items;
        this.playlists = this.filterPlaylists(data as SpotifyApi.ListOfUsersPlaylistsResponse);
        this.playlists.items = currentPlaylists.concat(this.playlists.items);
      }
    ).finally(() => this.isLoading = false);
  }

  /**
   * Filter out playlists that are owned by the current user.
   */
  filterPlaylists(playlists: ListOfUsersPlaylistsResponse): SpotifyApi.ListOfUsersPlaylistsResponse {
    playlists.items = playlists.items.filter(playlist => playlist.owner.id !== sessionStorage.getItem('userId'))
    return playlists;
  }

  /**
   * Create a copy of the playlist
   * @param id
   */
  remixPlaylist(playlist: SpotifyApi.PlaylistObjectSimplified) {
    this.isLoading = true;
    this.api.remixPlaylist(playlist.id).then().finally(() => this.isLoading = false);
  }
}
