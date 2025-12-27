import { join } from 'node:path';
import { readdir } from 'node:fs/promises';

export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: any;
}

/**
 * Finds all package.json files recursively in a directory.
 * @param dir The directory to start searching from.
 * @returns A promise that resolves to an array of paths to package.json files.
 */
export async function findPackageJsons(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = join(dir, dirent.name);
      if (dirent.isDirectory()) {
        // Ignore nested node_modules
        if (dirent.name === 'node_modules') {
          return [];
        }
        return findPackageJsons(res);
      }
      return dirent.name === 'package.json' ? res : [];
    }),
  );

  return Array.prototype.concat(...files);
}

/**
 * Reads and parses a package.json file.
 * @param path The path to the package.json file.
 * @returns A promise that resolves to the parsed PackageJson object.
 */
export async function readPackageJson(path: string): Promise<PackageJson> {
  const file = Bun.file(path);
  return await file.json<PackageJson>();
}
