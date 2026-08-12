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
    loadComponent: () => import('./pages/playlists/playlists').then((module) => module.PlaylistsPage),
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
    loadComponent: () => import('./pages/settings/settings').then((module) => module.SettingsPage),
    title: 'Settings | Spotify Manager',
  },
  { path: '**', redirectTo: '' },
];
