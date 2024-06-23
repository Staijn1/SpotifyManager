import { SpotifyManagerAction } from "../SpotifyManagerAction";

export enum TopItemsStatsAction {
  UPDATE_TOP_ARTIST_TIME_RANGE = 'UPDATE_TOP_ARTIST_TIME_RANGE',
  UPDATE_TOP_TRACK_TIME_RANGE = 'UPDATE_TOP_TRACK_TIME_RANGE',
}


export class UpdateTopArtistTimeRange implements SpotifyManagerAction<string> {
  readonly type = TopItemsStatsAction.UPDATE_TOP_ARTIST_TIME_RANGE;
  public payload: string;

  constructor(payload: string) {
    this.payload = payload;
  }
}

export class UpdateTopTrackTimeRange implements SpotifyManagerAction<string> {
  readonly type = TopItemsStatsAction.UPDATE_TOP_TRACK_TIME_RANGE;
  public payload: string;

  constructor(payload: string) {
    this.payload = payload;
  }
}
