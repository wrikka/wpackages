/**
 * Type definitions for BuildPC
 */

/**
 * Information about a single file
 */
export interface FileInfo {
  path: string;
  content: string;
  imports: string[];
}

/**
 * Package structure definition
 */
export interface PackageStructure {
  name: string;
  files: FileInfo[];
}

/**
 * Bundle processing state
 */
export interface BundleState {
  processedFiles: Set<string>;
  allFiles: FileInfo[];
  detectedDependencies: Set<string>;
}

/**
 * Options for building packages
 */
export interface BuildPCOptions {
  aiMode?: boolean;
  openaiKey?: string | undefined;
}

/**
 * Main package.json structure
 */
export interface MainPackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  author?: string;
  [key: string]: unknown;
}

/**
 * Result of building a package
 */
export interface BuildResult {
  state: BundleState;
  packageStructure: PackageStructure;
  packagesDir: string;
}
