import {Injectable} from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  protected readonly rootPath = path.join(__dirname, 'assets')

  /**
   * Create the root path if it doesn't exist
   */
  constructor() {
    this.createDirectoryIfNotExists(this.rootPath);
  }

  /**
   * Create a new directory if it doesn't exist already
   * @param  directory
   */
  createDirectoryIfNotExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {recursive: true});
    }
  }

  /**
   * Write a file to the root path, or to a subdirectory of this root path if provided
   * @param fileName
   * @param data
   * @param subdirectory
   */
  writeFile(fileName: string, data: string, subdirectory: string[] = []): string {
    const dirPath = path.join(this.rootPath, ...subdirectory);
    this.createDirectoryIfNotExists(dirPath)
    const filePath = path.join(dirPath, fileName)
    fs.writeFileSync(filePath, data);
    return filePath;
  }

  /**
   * Read file with absolute path
   * @param  directory
   */
  readFile(directory: string): string {
    return fs.readFileSync(directory, 'utf8');
  }
}
