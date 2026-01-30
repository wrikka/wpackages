import fs from "node:fs/promises";
import path from "node:path";
import { analyzeGraph } from "./analyzer";
import { analyzeFile } from "./ast-parser";
import { DiskCache } from "./disk-cache";
import { findSourceFiles } from "./file-finder";
import { getResolvedAliases, loadTsConfig } from "./tsconfig-loader";
import {
	AnalysisResult,
	AnalyzeOptions,
	DependencyGraph,
	PackageAnalysisResult,
	WorkspaceAnalysisResult,
} from "./types";
import { findMonorepoRoot, listWorkspacePackages } from "./workspace";

type PackageJson = {
	main?: unknown;
	module?: unknown;
	types?: unknown;
	bin?: unknown;
	exports?: unknown;
};

function collectExportStrings(value: unknown): string[] {
	if (typeof value === "string") return [value];
	if (Array.isArray(value)) {
		return value.flatMap(v => collectExportStrings(v));
	}
	if (value && typeof value === "object") {
		return Object.values(value as Record<string, unknown>).flatMap(v => collectExportStrings(v));
	}
	return [];
}

async function detectEntrypointsFromPackageJson(cwd: string): Promise<string[]> {
	try {
		const pkgPath = path.join(cwd, "package.json");
		const raw = await fs.readFile(pkgPath, "utf-8");
		const pkg = JSON.parse(raw) as PackageJson;

		const candidates = new Set<string>();
		const addIfString = (v: unknown) => {
			if (typeof v === "string" && v.length > 0) {
				candidates.add(v);
			}
		};

		addIfString(pkg.main);
		addIfString(pkg.module);
		addIfString(pkg.types);

		if (typeof pkg.bin === "string") {
			addIfString(pkg.bin);
		} else if (pkg.bin && typeof pkg.bin === "object") {
			for (const v of Object.values(pkg.bin as Record<string, unknown>)) {
				addIfString(v);
			}
		}

		for (const exp of collectExportStrings(pkg.exports)) {
			addIfString(exp);
		}

		return [...candidates]
			.filter(p => p.startsWith(".") || p.startsWith("/") || /^[a-zA-Z]:/.test(p))
			.map(p => path.resolve(cwd, p));
	} catch {
		return [];
	}
}

/**
 * Main function to find unused code.
 */
export async function findUnused(options: Partial<AnalyzeOptions>): Promise<AnalysisResult> {
	const cwd = options.cwd ?? process.cwd();
	const providedEntrypoints = options.entrypoints ?? [];
	const detectedEntrypoints = providedEntrypoints.length === 0
		? await detectEntrypointsFromPackageJson(cwd)
		: [];

	const config: AnalyzeOptions = {
		cwd,
		entrypoints: providedEntrypoints.length > 0 ? providedEntrypoints : detectedEntrypoints,
		ignore: options.ignore ?? [],
		...options,
	};

	console.log("Starting analysis...");

	const tsconfig = await loadTsConfig(config.cwd);
	const aliases = getResolvedAliases(tsconfig, config.cwd);

	const allFiles = await findSourceFiles(config.cwd, config.ignore);
	console.log(`Found ${allFiles.length} source files to analyze.`);

	const cacheEnabled = options.cache !== false;
	const cacheFile = typeof options.cacheFile === "string" ? options.cacheFile : ".unused-cache.json";
	const cache = cacheEnabled ? await DiskCache.load(config.cwd, cacheFile) : null;

	const analysisResults = await Promise.all(
		allFiles.map(async (filePath) => {
			if (!cache) return await analyzeFile(filePath);
			try {
				const stat = await fs.stat(filePath);
				const cached = cache.get(filePath, { mtimeMs: stat.mtimeMs, size: stat.size });
				if (cached !== undefined) return cached;
				const parsed = await analyzeFile(filePath);
				cache.set(filePath, { mtimeMs: stat.mtimeMs, size: stat.size }, parsed);
				return parsed;
			} catch {
				return await analyzeFile(filePath);
			}
		}),
	);

	const graph: DependencyGraph = new Map();
	for (const result of analysisResults) {
		if (result) {
			graph.set(result.path, result);
		}
	}

	console.log("Dependency graph built. Analyzing for unused code...");

	const result = await analyzeGraph(graph, config, aliases);

	if (cache) {
		await cache.save();
	}

	console.log("\n✨ Analysis complete!");

	return result;
}

export async function findUnusedWorkspace(options: Partial<AnalyzeOptions>): Promise<WorkspaceAnalysisResult> {
	const cwd = options.cwd ?? process.cwd();
	const root = await findMonorepoRoot(cwd);
	const workspacePackages = await listWorkspacePackages(root);

	const packages = await Promise.all(
		workspacePackages.map(async (pkg): Promise<PackageAnalysisResult> => {
			const analysis = await findUnused({
				cwd: pkg.dir,
				entrypoints: options.entrypoints ?? [],
				ignore: options.ignore ?? [],
			});
			return {
				...analysis,
				packageName: pkg.name,
				cwd: pkg.dir,
			};
		}),
	);

	return {
		mode: "workspace",
		root,
		packages,
	};
}
