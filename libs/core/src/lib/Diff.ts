import { PlaylistTrackObject } from './SpotifyAPI';

export type Diff = [DiffIdentifier, PlaylistTrackObject];
export enum DiffIdentifier {
  UNCHANGED = 'UNCHANGED',
  REMOVED_IN_ORIGINAL = 'REMOVED_IN_ORIGINAL',
  ADDED_IN_ORIGINAL = 'ADDED_IN_ORIGINAL',
  REMOVED_IN_REMIX = 'REMOVED_IN_REMIX',
  ADDED_IN_REMIX = 'ADDED_IN_REMIX',
  ADDED_IN_BOTH = 'ADDED_IN_BOTH',
}
