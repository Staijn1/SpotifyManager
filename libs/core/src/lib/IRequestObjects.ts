/**
 * In this file you can define the request body definitions for endpoints in the API.
 * Do NOT decorate these interfaces with NestJS @ApiProperty decorators for Swagger, as it will lead to crashes in the front-end.
 * Instead, create a separate class in the API project that implements these interfaces and decorates them with @ApiProperty.
 */


import { EpisodeObjectFull, TrackObjectFull } from './SpotifyAPI';
import { IUserPreferences } from './UserPreferences';

export interface ICompareRemixedPlaylistRequest {
  remixedPlaylistId: string;
}

export interface IPlaylistSyncRequest {
  remixedPlaylistId: string;
  tracks: (TrackObjectFull | EpisodeObjectFull)[];
}

export type IUserPreferencesRequest = IUserPreferences;


export interface IRemixPlaylistRequest {
  playlistId: string;
  ignoreNotificationsForPlaylist: boolean;
}
