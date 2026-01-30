import fs from "node:fs/promises";
import path from "node:path";
import picomatch from "picomatch";
import type { AnalysisResult, AnalyzeOptions, DependencyGraph } from "../types";
import { resolvePath } from "../utils/resolver";
import type { ResolvedAlias } from "./tsconfig-loader";

/**
 * Analyzes the dependency graph to find unused files, dependencies, and exports.
 */
export async function analyzeGraph(
	graph: DependencyGraph,
	options: AnalyzeOptions,
	aliases: ResolvedAlias[],
): Promise<AnalysisResult> {
	const allFilePaths = new Set(graph.keys());

	// 1. Find Unused Files and Exports simultaneously
	const { unusedFiles, unusedExports } = findUnusedCode(graph, options, allFilePaths, aliases);

	// 2. Find Unused Dependencies
	const unusedDependencies = await findUnusedDependencies(graph, options);

	const filtered = applyIgnoreRules({ unusedFiles, unusedDependencies, unusedExports }, options);
	return filtered;
}

function compileGlobMatchers(patterns: string[] | undefined): Array<(value: string) => boolean> {
	const list = patterns ?? [];
	return list.filter(Boolean).map((p) => picomatch(p, { dot: true }));
}

function applyIgnoreRules(result: AnalysisResult, options: AnalyzeOptions): AnalysisResult {
	const ignoreFileMatchers = compileGlobMatchers(options.ignoreUnusedFiles);
	const ignoreExports = new Set(options.ignoreExports ?? []);
	const ignoreDeps = new Set(options.ignoreDependencies ?? []);

	const unusedFiles = ignoreFileMatchers.length === 0
		? result.unusedFiles
		: result.unusedFiles.filter((abs) => {
			const rel = path.relative(options.cwd, abs).replaceAll("\\", "/");
			return !ignoreFileMatchers.some((isMatch) => isMatch(rel));
		});

	const unusedDependencies = ignoreDeps.size === 0
		? result.unusedDependencies
		: result.unusedDependencies.filter((d) => !ignoreDeps.has(d));

	const unusedExportsResult = new Map<string, string[]>();
	for (const [filePath, exports] of result.unusedExports.entries()) {
		const rel = path.relative(options.cwd, filePath).replaceAll("\\", "/");
		if (ignoreFileMatchers.some((isMatch) => isMatch(rel))) {
			continue;
		}

		const filteredExports = exports.filter((e) => !ignoreExports.has(e) && !ignoreExports.has("*"));

		if (filteredExports.length > 0) {
			unusedExportsResult.set(rel, filteredExports);
		}
	}

	return { unusedFiles, unusedDependencies, unusedExports: unusedExportsResult };
}

function findUnusedCode(
	graph: DependencyGraph,
	options: AnalyzeOptions,
	allFilePaths: Set<string>,
	aliases: ResolvedAlias[],
): { unusedFiles: string[]; unusedExports: Map<string, string[]> } {
	const reachableFiles = new Set<string>();
	const allUsedExports = new Map<string, Set<string>>(); // Map<filePath, Set<usedExport>>
	const entryPoints = options.entrypoints.map(p => path.resolve(options.cwd, p));

	const queue: string[] = [];
	for (const ep of entryPoints) {
		if (allFilePaths.has(ep)) {
			reachableFiles.add(ep);
			queue.push(ep);
		}
	}

	while (queue.length > 0) {
		const current = queue.pop();
		if (!current) break;
		const node = graph.get(current);
		if (!node) continue;

		for (const imp of node.imports) {
			const resolved = resolvePath(imp.module, node.path, allFilePaths, aliases);
			if (!resolved) continue;

			if (!allUsedExports.has(resolved)) {
				allUsedExports.set(resolved, new Set<string>());
			}
			const used = allUsedExports.get(resolved);
			if (used) {
				imp.specifiers.forEach(spec => used.add(spec));
			}

			if (!reachableFiles.has(resolved)) {
				reachableFiles.add(resolved);
				queue.push(resolved);
			}
		}

		for (const reExport of node.reExports) {
			const resolved = resolvePath(reExport.module, node.path, allFilePaths, aliases);
			if (!resolved) continue;
			if (!reachableFiles.has(resolved)) {
				reachableFiles.add(resolved);
				queue.push(resolved);
			}
		}
	}

	// Re-export propagation pass
	let changed = true;
	while (changed) {
		changed = false;
		for (const [filePath, node] of graph.entries()) {
			const usedExports = allUsedExports.get(filePath);
			if (!usedExports) continue;

			for (const reExport of node.reExports) {
				const sourceFile = resolvePath(reExport.module, node.path, allFilePaths, aliases);
				if (!sourceFile) continue;

				const sourceUsed = allUsedExports.get(sourceFile) ?? new Set<string>();
				const originalSize = sourceUsed.size;

				if (usedExports.has("*")) {
					sourceUsed.add("*");
				} else if (reExport.exportAll) {
					for (const spec of usedExports) {
						sourceUsed.add(spec);
					}
				} else {
					for (const [exportedName, importedName] of reExport.specifiers.entries()) {
						if (usedExports.has(exportedName)) {
							sourceUsed.add(importedName);
						}
					}
				}

				if (sourceUsed.size > originalSize) {
					allUsedExports.set(sourceFile, sourceUsed);
					changed = true;
				}
			}
		}
	}

	const unusedFiles = [...allFilePaths].filter(file => !reachableFiles.has(file));

	const unusedExportsResult = new Map<string, string[]>();
	for (const [filePath, node] of graph.entries()) {
		if (node.exports.size === 0 || entryPoints.includes(filePath)) continue;

		const used = allUsedExports.get(filePath);
		if (!used || used.has("*")) {
			// If nothing imports the file, or it has a namespace import, all exports are considered unused
			// unless the file is reachable (imported by something)
			if (!reachableFiles.has(filePath) && !used?.has("*")) {
				const unused = [...node.exports];
				if (unused.length > 0) {
					unusedExportsResult.set(filePath, unused);
				}
			}
			continue;
		}

		const unused = [...node.exports].filter(exp => !used.has(exp));
		if (unused.length > 0) {
			unusedExportsResult.set(filePath, unused);
		}
	}

	return { unusedFiles, unusedExports: unusedExportsResult };
}

async function findUnusedDependencies(graph: DependencyGraph, options: AnalyzeOptions): Promise<string[]> {
	const packageJsonPath = path.join(options.cwd, "package.json");
	try {
		const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
		const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
		const depKeys = Object.keys(dependencies);

		const allExternalImports = new Set<string>();
		for (const node of graph.values()) {
			for (const imp of node.imports) {
				if (typeof imp.module === "string" && !imp.module.startsWith(".") && !imp.module.startsWith("node:")) {
					const parts = imp.module.split("/");
					const packageName = parts[0]?.startsWith("@")
						? (parts[1] ? `${parts[0]}/${parts[1]}` : undefined)
						: parts[0];
					if (packageName) {
						allExternalImports.add(packageName);
					}
				}
			}
		}

		return depKeys.filter(dep => !allExternalImports.has(dep));
	} catch (e) {
		console.warn("Could not read or parse package.json. Skipping dependency check.", e);
		return [];
	}
}
