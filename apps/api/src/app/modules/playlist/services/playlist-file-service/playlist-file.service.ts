import {Injectable} from '@nestjs/common';
import {FileService} from '../../../util/services/file/file.service';
import path from 'path';

@Injectable()
export class PlaylistFileService extends FileService {
  /**
   * Write a playlist to a JSON file.
   * @param {SpotifyApi.PlaylistObjectFull} playlist
   * @param {string} userId
   * @returns {string}
   */
  writePlaylist(playlist: SpotifyApi.PlaylistObjectFull, userId: string): string {
    // Todo: what happens if a user forked the same playlist twice?
    return this.writeFile(`${playlist.id}.json`, JSON.stringify(playlist), ['forks', userId]);
  }

  /**
   * Read a playlist from a JSON file.
   */
  readPlaylist(playlistId: string, userId: string): SpotifyApi.PlaylistObjectFull {
    const pathToPlaylist = path.join(this.rootPath, 'forks', userId, `${playlistId}.json`);
    return JSON.parse(this.readFile(pathToPlaylist));
  }
}
