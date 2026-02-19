import { findPackageJsons, readPackageJson, writePackageJson } from "../adapters/file-system.js";
import { fetchMultiplePackageInfos } from "../adapters/npm-registry.js";
import { filterDependencies, updateDependencyInfo } from "../utils/dependency.js";
import type { CheckOptions, DependencyInfo, UpdateResult } from "../types/index.js";

export async function checkDependencies(options: CheckOptions = {}): Promise<UpdateResult> {
	const cwd = options.cwd || process.cwd();
	const packageJson = readPackageJson(cwd);
	const dependencies = filterDependencies(packageJson, options);

	const packageNames = dependencies.map((dep) => dep.name);
	const packageInfos = await fetchMultiplePackageInfos(packageNames, options.concurrency || 10);

	const dependencyInfos: DependencyInfo[] = dependencies.map((dep) => {
		const packageInfo = packageInfos.get(dep.name);

		if (!packageInfo) {
			return {
				name: dep.name,
				currentVersion: dep.version || '0.0.0',
				latestVersion: dep.version || '0.0.0',
				wantedVersion: dep.version || '0.0.0',
				type: dep.type,
				outdated: false,
			};
		}

		const latestVersion = packageInfo.version;
		const publishTime = packageInfo.time?.[latestVersion];

		return updateDependencyInfo(
			{
				name: dep.name,
				currentVersion: dep.version || '0.0.0',
				latestVersion,
				wantedVersion: latestVersion,
				type: dep.type,
				outdated: false,
			},
			latestVersion,
			publishTime,
		);
	});

	const outdatedCount = dependencyInfos.filter((dep) => dep.outdated).length;
	const hasBreakingChanges = dependencyInfos.some((dep) => dep.breaking);

	return {
		dependencies: dependencyInfos,
		outdatedCount,
		totalCount: dependencyInfos.length,
		hasBreakingChanges,
	};
}

export async function updateDependencies(options: CheckOptions = {}): Promise<void> {
	const cwd = options.cwd || process.cwd();
	const result = await checkDependencies(options);

	if (result.outdatedCount === 0) {
		console.log("All dependencies are up to date!");
		return;
	}

	const packageJson = readPackageJson(cwd);

	for (const dep of result.dependencies) {
		if (!dep.outdated || dep.breaking) continue;

		if (dep.type === "dependencies" && packageJson.dependencies) {
			packageJson.dependencies[dep.name] = dep.wantedVersion;
		} else if (dep.type === "devDependencies" && packageJson.devDependencies) {
			packageJson.devDependencies[dep.name] = dep.wantedVersion;
		} else if (dep.type === "peerDependencies" && packageJson.peerDependencies) {
			packageJson.peerDependencies[dep.name] = dep.wantedVersion;
		} else if (dep.type === "optionalDependencies" && packageJson.optionalDependencies) {
			packageJson.optionalDependencies[dep.name] = dep.wantedVersion;
		}
	}

	writePackageJson(packageJson, cwd);
	console.log(`Updated ${result.outdatedCount} dependencies`);
}

export async function checkDependenciesRecursive(options: CheckOptions = {}): Promise<Map<string, UpdateResult>> {
	const cwd = options.cwd || process.cwd();
	const packageDirs = findPackageJsons(cwd);
	const results = new Map<string, UpdateResult>();

	for (const dir of packageDirs) {
		const result = await checkDependencies({ ...options, cwd: dir });
		results.set(dir, result);
	}

	return results;
}
