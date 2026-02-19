import { analyzeProject } from './project-analyzer.js';
import { checkDependencies } from './dependency-service.js';
import type { CheckOptions, InspectResult } from '../types/index.js';

export async function inspectProject(options: CheckOptions = {}): Promise<InspectResult> {
  const cwd = options.cwd || process.cwd();
  
  const project = analyzeProject(cwd);
  const dependencyResult = await checkDependencies(options);
  
  const totalPackages = dependencyResult.totalCount;
  const outdatedPackages = dependencyResult.outdatedCount;
  const outdatedPercentage = totalPackages > 0 ? Math.round((outdatedPackages / totalPackages) * 100) : 0;
  
  return {
    project,
    dependencies: dependencyResult.dependencies,
    summary: {
      totalPackages,
      outdatedPackages,
      outdatedPercentage,
      lastChecked: new Date().toISOString(),
    },
  };
}
