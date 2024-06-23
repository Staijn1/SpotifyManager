import { TimeRange } from '@spotify-manager/core';

export type TopItemsStats = {
  topTracksTimeRange: TimeRange;
  topArtistsTimeRange: TimeRange;
}

const initialState: TopItemsStats = {
  topTracksTimeRange: 'medium_term',
  topArtistsTimeRange: 'medium_term',
}

export const topItemsStatsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'UPDATE_TOP_ARTIST_TIME_RANGE': {
      return { ...state, topArtistsTimeRange: action.payload };
    }
    case 'UPDATE_TOP_TRACK_TIME_RANGE': {
      return { ...state, topTracksTimeRange: action.payload };
    }
    default:
      return state;
  }
}
