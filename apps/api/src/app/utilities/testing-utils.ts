import { PlaylistTrackResponse, PlaylistTrackObject, AlbumObjectSimplified } from '@spotify-manager/core';

export const createEmptyMockAlbum = (): AlbumObjectSimplified => ({
  album_type: '',
  available_markets: [],
  external_urls: { spotify: '' },
  href: '',
  id: '',
  images: [],
  name: '',
  type: 'album',
  uri: ''
});

export const buildMockPlaylistTrackResponse = (songs: string[]): PlaylistTrackResponse => {
  const items: PlaylistTrackObject[] = songs.map(song => ({
    added_at: new Date().toISOString(),
    added_by: {
      display_name: '',
      external_urls: { spotify: '' },
      href: '',
      id: '',
      type: 'user',
      uri: ''
    },
    is_local: false,
    track: {
      id: song,
      uri: `spotify:track:${song}`,
      type: 'track',
      name: song,
      href: '',
      external_ids: {},
      external_urls: { spotify: '' },
      album: createEmptyMockAlbum(),
      artists: [],
      available_markets: [],
      disc_number: 1,
      duration_ms: 0,
      explicit: false,
      is_playable: true,
      popularity: 0,
      preview_url: '',
      track_number: 1
    }
  }));

  return {
    href: '',
    items,
    limit: songs.length,
    next: null,
    offset: 0,
    previous: null,
    total: songs.length
  };
};
