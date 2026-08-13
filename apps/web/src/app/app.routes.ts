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
    path: 'playlists/:playlistId',
    loadComponent: () =>
      import('./pages/playlist-detail/playlist-detail').then(
        (module) => module.PlaylistDetailPage,
      ),
    title: 'Inspect playlist | Spotify Manager',
  },
  {
    path: 'forks',
    loadComponent: () => import('./pages/forks/forks').then((module) => module.ForksPage),
    title: 'Forks | Spotify Manager',
  },
  {
    path: 'forks/:forkId',
    loadComponent: () =>
      import('./pages/fork-detail/fork-detail').then((module) => module.ForkDetailPage),
    title: 'Review changes | Spotify Manager',
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((module) => module.SettingsPage),
    title: 'Settings | Spotify Manager',
  },
  { path: '**', redirectTo: '' },
];
