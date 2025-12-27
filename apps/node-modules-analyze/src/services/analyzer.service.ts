import { join, dirname } from 'node:path';
import { stat, readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { findPackageJsons, readPackageJson, type PackageJson } from '../utils/file.util';
import type { AnalysisReport, AnalyzedPackage } from '../types/analysis.types';

async function getDirectorySize(directory: string): Promise<number> {
  try {
    const files = await readdir(directory, { withFileTypes: true });
    const sizes = await Promise.all(
      files.map(async (file: Dirent) => {
        const path = join(directory, file.name);
        if (file.isDirectory()) {
          return await getDirectorySize(path);
        }
        const stats = await stat(path).catch(() => ({ size: 0 }));
        return stats.size;
      }),
    );
    return sizes.reduce((acc: number, size: number) => acc + size, 0);
  } catch {
    return 0;
  }
}

export async function analyzeProject(projectPath: string): Promise<AnalysisReport> {
  const nodeModulesPath = join(projectPath, 'node_modules');
  const packageJsonPaths = await findPackageJsons(nodeModulesPath);

  const packages: AnalyzedPackage[] = await Promise.all(
    packageJsonPaths.map(async (pkgPath) => {
      const packageJson = await readPackageJson(pkgPath);
      const dir = dirname(pkgPath);
      const size = await getDirectorySize(dir);
      const dependencies = [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.peerDependencies || {}),
      ];

      return {
        name: packageJson.name,
        version: packageJson.version,
        path: dir,
        size,
        dependencies,
        packageJson,
      };
    }),
  );

  const totalSize = packages.reduce((sum, pkg) => sum + pkg.size, 0);

  const duplicates: Record<string, AnalyzedPackage[]> = {};
  packages.forEach(pkg => {
    if (!duplicates[pkg.name]) {
      duplicates[pkg.name] = [];
    }
    duplicates[pkg.name].push(pkg);
  });

  const filteredDuplicates = Object.fromEntries(
    Object.entries(duplicates).filter(([, pkgs]) => pkgs.length > 1)
  );

  return {
    totalSize,
    packageCount: packages.length,
    packages,
    duplicates: filteredDuplicates,
  };
}
