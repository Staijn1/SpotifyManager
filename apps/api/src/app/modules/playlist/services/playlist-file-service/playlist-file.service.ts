import {Injectable} from '@nestjs/common';
import {FileService} from '../../../util/services/file/file.service';
import path from 'path';
import * as fs from 'fs';
import {RemixedPlaylistInformation} from '@spotify/data';

@Injectable()
export class PlaylistFileService extends FileService {
  /**
   * Write a playlist to a JSON file.
   * @param {SpotifyApi.PlaylistObjectFull} playlist
   * @param {string} userId
   * @returns {string}
   */
  writePlaylist(playlist: SpotifyApi.PlaylistObjectFull, userId: string): string {
    // Get unix timestamp and add it to the filename.
    const timestamp = Math.floor(Date.now() / 1000);
    const filename = `${timestamp}-${playlist.id}.json`;
    const pathToPlaylist = path.join(this.rootPath, 'remixes', userId, filename);
    return this.writeFile(filename, JSON.stringify(playlist), ['remixes', userId]);
  }

  /**
   * A playlist can be copied more than once by one user. The state of the playlist being copied is saved to a file in the format
   * <timestamp>-<playlistId>.json.
   * This function reads all the files in the remixes directory for this user, and returns the creation dates of the files.
   * @param {string} playlistId
   * @param {string} userId
   * @returns {OriginalPlaylistInformation[]}
   */
  async getOriginalVersionsForPlaylist(playlistId: string, userId: string): Promise<RemixedPlaylistInformation[]> {
    const pathToPlaylist = path.join(this.rootPath, 'remixes', userId);
    const files = await fs.promises.readdir(pathToPlaylist);
    return files.map(file => {
      const [timestamp, id] = file.split('-');
      return {
        createdOn: parseInt(timestamp, 10),
        id: id.replace('.json', ''),
      };
    }).filter(file => file.id === playlistId);
  }

  /**
   * Read a playlist from a JSON file.
   */
  readPlaylist(playlistId: string, userId: string): SpotifyApi.PlaylistObjectFull {
    const pathToPlaylist = path.join(this.rootPath, 'remixes', userId, `${playlistId}.json`);
    return JSON.parse(this.readFile(pathToPlaylist));
  }
}
