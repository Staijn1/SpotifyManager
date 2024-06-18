import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssDisc, cssHome } from '@ng-icons/css.gg';
import { heroBookOpen } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-documentation-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, RouterLinkActive],
  providers: [provideIcons({ cssDisc, cssHome, heroBookOpen })],
  templateUrl: './documentation-navigation-bar.component.html',
  styleUrl: './documentation-navigation-bar.component.scss'
})
export class DocumentationNavigationBarComponent {
  private static navigationItems: RootNavigationItem[] = [
    {
      title: 'Getting Started',
      icon: 'cssHome',
      path: '/docs/get-started',
      markdownUrl: "/assets/docs/get-started.md",
      children: []
    },
    {
      title: 'Remixing a Playlist',
      icon: 'cssDisc',
      children: [
        {
          title: 'Overview',
          path: '/docs/remix/overview',
          markdownUrl: '/assets/docs/remix-overview.md'
        }
      ]
    }
  ];

  get navigationItems() {
    return DocumentationNavigationBarComponent.navigationItems;
  }

  /**
   * Returns the markdown URL for a given path.
   * Flattens the navigation items to easily find the markdown URL for a given path.
   */
  public static GetMarkdownUrlForPath(path: string): string | undefined{
    const flattenedNavigationItems = DocumentationNavigationBarComponent.flattenNavigationItems(DocumentationNavigationBarComponent.navigationItems);

    return flattenedNavigationItems.find(item => item.path === path)?.markdownUrl;
  }

  protected static flattenNavigationItems(navigationItems: RootNavigationItem[]): NavigationItem[] {
    const flattenedItems: NavigationItem[] = [];

    for (const item of navigationItems) {
      if (typeof item.path === 'string' && typeof item.markdownUrl === 'string') {
        flattenedItems.push({
          title: item.title,
          path: item.path,
          markdownUrl: item.markdownUrl
        });
      }

      for (const child of item.children) {
        flattenedItems.push({
          title: child.title,
          path: child.path,
          markdownUrl: child.markdownUrl
        });
      }
    }

    return flattenedItems;
  }
}


export type RootNavigationItem = {
  title: string;
  icon: string;
  path?: string;
  children: NavigationItem[];
  markdownUrl?: string;
}

export type NavigationItem = {
  markdownUrl: string;
  title: string;
  path: string;
}
