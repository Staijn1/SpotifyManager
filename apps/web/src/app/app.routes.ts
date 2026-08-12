import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.DashboardPage),
    title: 'Overview | Spotify Manager',
  },
  {
    path: 'playlists',
    loadComponent: () =>
      import('./pages/feature-placeholder/feature-placeholder').then(
        (module) => module.FeaturePlaceholderPage,
      ),
    data: {
      eyebrow: 'Playlist search',
      title: 'Choose an original playlist',
      description: 'Provider-backed playlist search will land here after the secure Spotify connection flow.',
    },
    title: 'Browse playlists | Spotify Manager',
  },
  {
    path: 'forks',
    loadComponent: () =>
      import('./pages/feature-placeholder/feature-placeholder').then(
        (module) => module.FeaturePlaceholderPage,
      ),
    data: {
      eyebrow: 'Your remixes',
      title: 'Forks stay yours',
      description: 'Fork summaries, source status, pending proposals, and digest settings will live here.',
    },
    title: 'Forks | Spotify Manager',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/feature-placeholder/feature-placeholder').then(
        (module) => module.FeaturePlaceholderPage,
      ),
    data: {
      eyebrow: 'Account',
      title: 'Connections and notifications',
      description: 'Manage provider access, a verified digest email address, timezone, and delivery defaults.',
    },
    title: 'Settings | Spotify Manager',
  },
  { path: '**', redirectTo: '' },
];
