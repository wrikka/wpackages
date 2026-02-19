export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  wantedVersion: string;
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
  timeDiff?: number | undefined;
  outdated: boolean;
  breaking?: boolean;
}

export interface PackageJson {
  name?: string;
  version?: string;
  type?: 'module' | 'commonjs';
  main?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export interface CheckOptions {
  cwd?: string;
  recursive?: boolean;
  write?: boolean;
  include?: string[];
  exclude?: string[];
  install?: boolean;
  update?: boolean;
  concurrency?: number;
  failOnOutdated?: boolean;
  includePeer?: boolean;
  includeLocked?: boolean;
  maturityPeriod?: number;
}

export interface NpmPackageInfo {
  name: string;
  version: string;
  versions?: Record<string, {
    time?: string;
  }>;
  time?: Record<string, string>;
}

export interface UpdateResult {
  dependencies: DependencyInfo[];
  outdatedCount: number;
  totalCount: number;
  hasBreakingChanges: boolean;
}

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
