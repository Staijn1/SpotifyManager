import { PlaylistTrackObject } from './SpotifyAPI';

export type Diff = [DiffIdentifier, PlaylistTrackObject];
export type DiffIdentifier = 0 | 1 | -1;
