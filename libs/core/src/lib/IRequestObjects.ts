/**
 * In this file you can define the request body definitions for endpoints in the API.
 * Do NOT decorate these interfaces with NestJS @ApiProperty decorators for Swagger, as it will lead to crashes in the front-end.
 * Instead, create a separate class in the API project that implements these interfaces and decorates them with @ApiProperty.
 */


import { EpisodeObjectFull, TrackObjectFull } from './SpotifyAPI';
import { EmailNotificationFrequency } from './EmailNotificationFrequency';

export interface ICompareRemixedPlaylistRequest {
  originalPlaylistId: string;
  remixedPlaylistId: string;
}

export interface IPlaylistSyncRequest {
  originalPlaylistId: string;
  remixedPlaylistId: string;
  tracks: (TrackObjectFull | EpisodeObjectFull)[];
}

export interface IUserPreferencesRequest {
  originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency;
}
