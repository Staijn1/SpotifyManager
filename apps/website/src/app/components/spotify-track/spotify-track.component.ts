import { Component, Input } from '@angular/core';
import { ArtistObjectSimplified, EpisodeObjectFull, PlaylistTrackObject, TrackObjectFull } from '@spotify-manager/core';

@Component({
  selector: 'app-spotify-track',
  standalone: true,
  imports: [],
  templateUrl: './spotify-track.component.html',
  styleUrl: './spotify-track.component.scss'
})
export class SpotifyTrackComponent {
  @Input({
    transform: (value: PlaylistTrackObject | TrackObjectFull) => {
      // False positive
      //eslint-disable-next-line
      if ("track" in value) {
        return value.track;
      }
      return value;
    }
  }) track: TrackObjectFull | EpisodeObjectFull | undefined;

  @Input() ranking: number | undefined;

  get coverImage(): string {
    if (this.track?.type == 'track') {
      return this.track.album.images[1].url;
    }

    return this.track?.show.images[0].url ?? '';
  };

  get artists(): string {
    if (this.track?.type == 'track') {
      return this.track?.artists.map((artist: ArtistObjectSimplified) => artist.name).join(', ') ?? '';
    }

    return 'Episodes not supported yet';
  };
}
