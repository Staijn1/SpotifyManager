import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssDisc, cssHome } from '@ng-icons/css.gg';
import { heroBookOpen } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-vertical-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers: [provideIcons({ cssDisc, cssHome, heroBookOpen })],
  templateUrl: './documentation-navigation-bar.component.html',
  styleUrl: './documentation-navigation-bar.component.scss'
})
export class DocumentationNavigationBarComponent {
  navigationItems: RootNavigationItem[] = [
    {
      title: "Getting Started",
      icon: "cssHome",
      path: "/documentation/get-started",
      children: []
    },
    {
      title: "Remixing a Playlist",
      icon: "cssDisc",
      children: [
        {
          title: "Overview",
          path: "/docs/remix/overview",
          markdownUrl: "/assets/docs/test.md"
        }
      ]
    }
  ];

}


type RootNavigationItem = {
  title: string;
  icon: string;
  path?: string;
  children: NavigationItem[];
}

type NavigationItem = {
  markdownUrl: string;
  title: string;
  path: string;
}
