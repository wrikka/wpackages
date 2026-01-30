import type { DependencyInfo } from '../types/index.js';
import { suggestVersion, getMigrationGuide } from './smart-version.js';

export interface FixSuggestion {
  packageName: string;
  currentVersion: string;
  suggestedVersion: string;
  reason: string;
  risk: 'low' | 'medium' | 'high';
  migrationSteps: string[];
}

export function generateFixSuggestions(dependencies: DependencyInfo[]): FixSuggestion[] {
  return dependencies
    .filter((dep) => dep.outdated)
    .map((dep) => {
      const suggestion = suggestVersion(dep);
      const migrationSteps = getMigrationGuide(dep);
      
      return {
        packageName: dep.name,
        currentVersion: dep.currentVersion,
        suggestedVersion: suggestion.version,
        reason: suggestion.reason,
        risk: suggestion.risk,
        migrationSteps,
      };
    });
}

export function applySafeFixes(dependencies: DependencyInfo[]): DependencyInfo[] {
  return dependencies.map((dep) => {
    if (!dep.outdated || dep.breaking) return dep;
    
    const suggestion = suggestVersion(dep);
    if (suggestion.risk === 'high') return dep;
    
    return {
      ...dep,
      wantedVersion: suggestion.version,
    };
  });
}

export function getBreakingChangesReport(dependencies: DependencyInfo[]): string {
  const breakingDeps = dependencies.filter((dep) => dep.breaking);
  
  if (breakingDeps.length === 0) return '';
  
  let report = '\n⚠️  Breaking Changes Detected:\n';
  
  for (const dep of breakingDeps) {
    const migrationSteps = getMigrationGuide(dep);
    report += `\n${dep.name} (${dep.currentVersion} → ${dep.latestVersion}):\n`;
    for (const step of migrationSteps) {
      report += `  ${step}\n`;
    }
  }
  
  return report;
}
