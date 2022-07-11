import {Injectable} from '@nestjs/common';
import {SpotifyService} from '../../../../spotify/spotify.service';

@Injectable()
export class PlaylistService {
  constructor(private readonly spotifyService: SpotifyService) {
  }

  /**
   * Creates a new playlist and songs from the given playlist are copied to the new playlist.
   * The songs in the original playlist are saved in the database, so it can be used to sync the forked playlist with the original one later.
   * @param {string} playlistid
   * @returns {string}
   */
  public async forkPlaylist(playlistid: string): Promise<SpotifyApi.CreatePlaylistResponse> {
    const playlist = await this.spotifyService.getPlaylistInformation(playlistid);

    const newPlaylistName = `Fork - ${playlist.name}`;
    const newPlaylist = await this.spotifyService.createPlaylist(newPlaylistName);

    // The spotify api returns the tracks in the playlist but it limits the number of tracks to 100.
    // So we need to get the tracks in chunks of 100.
    // These chunks will also be saved in the database, and put in the new playlist.
    const amountOfChunks = Math.ceil(playlist.tracks.total / 100);

    for (let i = 0; i < amountOfChunks; i++) {
      const options = {
        offset: i * 100,
      };
      const tracks = await this.spotifyService.getTracksInPlaylist(playlistid, options);

      await this.spotifyService.addTracksToPlaylist(newPlaylist.id, tracks.items.map(track => track.track.uri));
    }
    return newPlaylist
  }
}
