import type { DependencyInfo } from './dependency.js';

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
