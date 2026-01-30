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
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
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
