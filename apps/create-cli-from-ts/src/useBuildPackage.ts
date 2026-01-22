import * as fs from "fs";
import * as path from "path";
import { useFileProcessor } from "./logic/file-processor";
import { useAutoInstaller } from "./logic/installer";
import { usePackageFileCreator, usePackageStructureCreator } from "./logic/package-creator";
import type { BuildPCOptions, BundleState, FileInfo, MainPackageJson, PackageStructure } from "./types";

// Re-export types for backward compatibility
export type { BuildPCOptions, BundleState, FileInfo, MainPackageJson, PackageStructure };

// Main business logic function
export const buildPackageLogic = async (
  entryFile: string,
  packageName: string,
  options: BuildPCOptions,
): Promise<{
  state: BundleState;
  packageStructure: PackageStructure;
  packagesDir: string;
}> => {
  const absolutePath = path.resolve(entryFile);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${entryFile}`);
  }

  const state: BundleState = {
    processedFiles: new Set<string>(),
    allFiles: [],
    detectedDependencies: new Set<string>(),
  };

  const processFile = useFileProcessor(state);
  await processFile(absolutePath);

  const createPackageStructure = usePackageStructureCreator();
  const packageStructure = createPackageStructure(packageName, state.allFiles);

  const createPackageFiles = usePackageFileCreator();
  const outputDir = process.cwd();
  const packagesDir = await createPackageFiles(packageStructure, outputDir, state.detectedDependencies, options);

  // Auto-install dependencies
  const autoInstall = useAutoInstaller();
  await autoInstall(packagesDir);

  return {
    state,
    packageStructure,
    packagesDir,
  };
};
