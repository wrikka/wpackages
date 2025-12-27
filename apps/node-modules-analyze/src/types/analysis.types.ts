import type { PackageJson } from '../utils/file.util';

export interface AnalyzedPackage {
  name: string;
  version: string;
  path: string;
  size: number; // in bytes
  dependencies: string[];
  packageJson: PackageJson;
}

export interface AnalysisReport {
  totalSize: number;
  packageCount: number;
  packages: AnalyzedPackage[];
  duplicates: Record<string, AnalyzedPackage[]>;
}
