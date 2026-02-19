import type { DependencyInfo } from './dependency.js';

export interface ProjectInfo {
  name: string;
  version: string;
  language: 'typescript' | 'javascript' | 'mixed';
  moduleFormat: 'esm' | 'cjs' | 'mixed';
  bundler: 'vite' | 'webpack' | 'rollup' | 'esbuild' | 'bun' | 'none' | 'unknown';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'unknown';
  dependenciesCount: number;
  devDependenciesCount: number;
  lastUpdated?: string;
  hasTypeScript: boolean;
  hasTests: boolean;
  buildTools: string[];
  frameworks: string[];
}

export interface InspectResult {
  project: ProjectInfo;
  dependencies: DependencyInfo[];
  summary: {
    totalPackages: number;
    outdatedPackages: number;
    outdatedPercentage: number;
    lastChecked: string;
  };
}
