import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spotify-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spotify-user.component.html',
  styleUrl: './spotify-user.component.scss'
})
export class SpotifyUserComponent {
  @Input() user: SpotifyApi.UserObjectPublic | undefined;
}
