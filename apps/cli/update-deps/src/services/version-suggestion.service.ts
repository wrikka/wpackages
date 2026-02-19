import type { DependencyInfo } from '../types/index.js';
import { parseVersion } from '../utils/version.js';

export interface VersionSuggestion {
  version: string;
  reason: string;
  risk: 'low' | 'medium' | 'high';
}

export function suggestVersion(dep: DependencyInfo): VersionSuggestion {
  const current = parseVersion(dep.currentVersion);
  const latest = parseVersion(dep.latestVersion);
  
  const majorDiff = latest.major - current.major;
  const minorDiff = latest.minor - current.minor;
  const patchDiff = latest.patch - current.patch;
  
  if (majorDiff > 0) {
    return {
      version: dep.latestVersion,
      reason: `Major version update (${current.major}.x.x → ${latest.major}.x.x)`,
      risk: 'medium',
    };
  }
  
  if (minorDiff > 0) {
    return {
      version: dep.latestVersion,
      reason: `Minor version update (${current.major}.${current.minor}.x → ${latest.major}.${latest.minor}.x)`,
      risk: 'low',
    };
  }
  
  if (patchDiff > 0) {
    return {
      version: dep.latestVersion,
      reason: `Patch version update (${current.major}.${current.minor}.${current.patch} → ${latest.major}.${latest.minor}.${latest.patch})`,
      risk: 'low',
    };
  }
  
  return {
    version: dep.latestVersion,
    reason: 'Already up to date',
    risk: 'low',
  };
}

export function getMigrationGuide(dep: DependencyInfo): string[] {
  const suggestions: string[] = [];
  
  if (dep.breaking) {
    suggestions.push(`⚠️  ${dep.name} has breaking changes from ${dep.currentVersion} to ${dep.latestVersion}`);
    suggestions.push('   Check the package release notes for migration guide');
    suggestions.push('   Consider updating tests and reviewing API changes');
  }
  
  if (dep.timeDiff && dep.timeDiff > 30) {
    suggestions.push(`ℹ️  ${dep.name} was last updated ${dep.timeDiff} days ago`);
  }
  
  return suggestions;
}
