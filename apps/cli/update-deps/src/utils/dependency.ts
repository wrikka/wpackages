import type { CheckOptions, DependencyInfo, PackageJson } from "../types/index.js";
import { compareVersions, isBreakingChange, calculateTimeDiff } from "./version.js";

export function filterDependencies(
  packageJson: PackageJson,
  options: CheckOptions,
): Array<{ name: string; version: string; type: DependencyInfo["type"] }> {
  const deps: Array<{ name: string; version: string; type: DependencyInfo["type"] }> = [];

  const addDeps = (depsObj: Record<string, string> | undefined, type: DependencyInfo["type"]) => {
    if (!depsObj) return;
    for (const [name, version] of Object.entries(depsObj)) {
      if (options.exclude?.includes(name)) continue;
      if (options.include && options.include.length > 0 && !options.include.includes(name)) continue;
      deps.push({ name, version, type });
    }
  };

  addDeps(packageJson.dependencies, "dependencies");
  addDeps(packageJson.devDependencies, "devDependencies");

  if (options.includePeer) {
    addDeps(packageJson.peerDependencies, "peerDependencies");
  }

  if (options.includeLocked) {
    addDeps(packageJson.optionalDependencies, "optionalDependencies");
  }

  return deps;
}

export function groupDependenciesByType(dependencies: DependencyInfo[]): Record<string, DependencyInfo[]> {
  return dependencies.reduce((acc, dep) => {
    if (!acc[dep.type]) acc[dep.type] = [];
    acc[dep.type].push(dep);
    return acc;
  }, {} as Record<string, DependencyInfo[]>);
}

export function sortDependencies(
  dependencies: DependencyInfo[],
  sortBy: "name-asc" | "name-desc" | "diff-asc" | "diff-desc" = "diff-desc",
): DependencyInfo[] {
  return [...dependencies].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "diff-asc":
        return (a.timeDiff || 0) - (b.timeDiff || 0);
      case "diff-desc":
      default:
        return (b.timeDiff || 0) - (a.timeDiff || 0);
    }
  });
}

export function updateDependencyInfo(
  dep: DependencyInfo,
  latestVersion: string,
  publishTime?: string,
): DependencyInfo {
  const currentVersion = dep.currentVersion || '0.0.0';
  const outdated = compareVersions(currentVersion, latestVersion) < 0;
  const breaking = outdated && isBreakingChange(currentVersion, latestVersion);
  const timeDiff = publishTime ? calculateTimeDiff(publishTime, new Date().toISOString()) : undefined;

  return {
    ...dep,
    currentVersion,
    latestVersion,
    wantedVersion: breaking ? currentVersion : latestVersion,
    outdated,
    breaking,
    timeDiff,
  };
}
