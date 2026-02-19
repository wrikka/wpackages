/**
 * File System Service - Pure functional approach
 */

import { Effect } from "effect";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export interface FileSystemError {
  readonly type: 'ReadDirError' | 'StatError' | 'FileExistsError';
  readonly message: string;
  readonly originalError: unknown;
}

// Pure function for creating file system error
export const createFileSystemError = (
  type: FileSystemError['type'],
  message: string,
  originalError: unknown
): FileSystemError => ({
  type,
  message,
  originalError,
});

// Pure function for walking directory
export const walkDirectory = (dir: string): Effect.Effect<readonly string[], FileSystemError> =>
  Effect.gen(function* () {
    const entries = yield* Effect.tryPromise({
      try: () => readdir(dir, { withFileTypes: true }),
      catch: (error) => createFileSystemError('ReadDirError', `Failed to read directory ${dir}: ${error}`, error),
    });

    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = yield* walkDirectory(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  });

// Pure function for checking file existence
export const fileExists = (path: string): Effect.Effect<boolean, FileSystemError> =>
  Effect.tryPromise({
    try: () => stat(path).then(() => true).catch(() => false),
    catch: (error) => createFileSystemError('StatError', `Failed to check file existence ${path}: ${error}`, error),
  });

// Pure function for reading file
export const readFile = (path: string): Effect.Effect<string, FileSystemError> =>
  Effect.tryPromise({
    try: () => Bun.file(path).text(),
    catch: (error) => createFileSystemError('ReadDirError', `Failed to read file ${path}: ${error}`, error),
  });

// Pure function for writing file
export const writeFile = (path: string, content: string): Effect.Effect<void, FileSystemError> =>
  Effect.tryPromise({
    try: () => Bun.write(path, content),
    catch: (error) => createFileSystemError('ReadDirError', `Failed to write file ${path}: ${error}`, error),
  });

// Pure function for creating directory
export const createDirectory = (path: string): Effect.Effect<void, FileSystemError> =>
  Effect.tryPromise({
    try: () => Bun.write(path, ""),
    catch: (error) => createFileSystemError('ReadDirError', `Failed to create directory ${path}: ${error}`, error),
  });

// Pure function for getting file stats
export const getFileStats = (path: string): Effect.Effect<{
  readonly size: number;
  readonly isFile: boolean;
  readonly isDirectory: boolean;
  readonly modified: Date;
}, FileSystemError> =>
  Effect.tryPromise({
    try: () => stat(path).then(stats => ({
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      modified: stats.mtime,
    })),
    catch: (error) => createFileSystemError('StatError', `Failed to get file stats ${path}: ${error}`, error),
  });

// Pure function for checking if path is file
export const isFile = (path: string): Effect.Effect<boolean, FileSystemError> =>
  Effect.map(getFileStats(path), stats => stats.isFile);

// Pure function for checking if path is directory
export const isDirectory = (path: string): Effect.Effect<boolean, FileSystemError> =>
  Effect.map(getFileStats(path), stats => stats.isDirectory);

// Pure function for getting file extension
export const getFileExtension = (path: string): string => {
  const lastDotIndex = path.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : path.slice(lastDotIndex + 1);
};

// Pure function for getting file name without extension
export const getFileNameWithoutExtension = (path: string): string => {
  const lastDotIndex = path.lastIndexOf('.');
  const lastSlashIndex = path.lastIndexOf('/');
  const fileName = lastSlashIndex > lastDotIndex 
    ? path.slice(lastSlashIndex + 1)
    : path.slice(Math.max(lastSlashIndex, lastDotIndex));
  return fileName;
};

// Pure function for normalizing path
export const normalizePath = (path: string): string => {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/');
};

// Pure function for joining paths
export const joinPaths = (...paths: string[]): string => {
  return paths.reduce((result, path) => join(result, path), '');
};

// Pure function for resolving relative path
export const resolveRelativePath = (from: string, to: string): string => {
  const fromDir = from.includes('/') ? from.slice(0, from.lastIndexOf('/')) : from;
  const resolved = join(fromDir, to);
  return normalizePath(resolved);
};

// File system service factory function
export const createFileSystemService = () => {
  return {
    walkDirectory,
    fileExists,
    readFile,
    writeFile,
    createDirectory,
    getFileStats,
    isFile,
    isDirectory,
    getFileExtension,
    getFileNameWithoutExtension,
    normalizePath,
    joinPaths,
    resolveRelativePath,
  };
};
