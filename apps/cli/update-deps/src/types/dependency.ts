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
