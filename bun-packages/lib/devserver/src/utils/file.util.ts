import { MIME_TYPES, SUPPORTED_FILE_EXTENSIONS } from '../constants';
import type { Logger } from '../types';

export class FileUtils {
  constructor(private logger: Logger) {}

  getMimeType(filePath: string): string {
    const ext = this.getFileExtension(filePath);
    return MIME_TYPES[ext] || 'text/plain';
  }

  getFileExtension(filePath: string): string {
    return filePath.slice(filePath.lastIndexOf('.'));
  }

  isSupportedFile(filePath: string): boolean {
    const ext = this.getFileExtension(filePath);
    return SUPPORTED_FILE_EXTENSIONS.includes(ext);
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const file = Bun.file(filePath);
      return await file.text();
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await Bun.write(filePath, content);
    } catch (error) {
      this.logger.error(`Failed to write file: ${filePath}`, error);
      throw error;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const file = Bun.file(filePath);
      return await file.exists();
    } catch {
      return false;
    }
  }

  async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stat = await Bun.file(filePath).stat();
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
  }

  resolvePath(...paths: string[]): string {
    return this.normalizePath(Bun.path.resolve(...paths));
  }

  getRelativePath(from: string, to: string): string {
    return this.normalizePath(Bun.path.relative(from, to));
  }

  async getFileStats(filePath: string) {
    try {
      const stat = await Bun.file(filePath).stat();
      return {
        size: stat.size,
        mtime: stat.mtime,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
      };
    } catch (error) {
      this.logger.error(`Failed to get file stats: ${filePath}`, error);
      throw error;
    }
  }
}
