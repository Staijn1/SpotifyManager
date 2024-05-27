import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssDisc, cssMail } from '@ng-icons/css.gg';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FaIconComponent, NgIcon],
  providers: [provideIcons({ cssDisc, cssMail })],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  rightArrowIcon = faArrowRight;
  readonly features = [
    {
      icon: 'cssDisc',
      title: 'Playlist Remixing',
      description: "Want more control over playlists that are not yours?<br>With Playlist Remixing, you can add or remove any song from any playlist and synchronize your version with the original"
    },
    {
      icon: 'cssMail',
      title: "Email Notifications",
      description: "Get notified when the original playlist of your remix has been updated."
    }
  ];
}
