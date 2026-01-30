import path from "node:path";
import type { ResolvedAlias } from "../services/tsconfig-loader";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"];

function toPosixPath(filePath: string): string {
	return filePath.replace(/\\/g, "/");
}

function isPosixLikeAbsolutePath(filePath: string): boolean {
	return filePath.startsWith("/") && !filePath.includes(":");
}

function getPathApi(referencePath: string): typeof path.posix {
	return isPosixLikeAbsolutePath(referencePath) ? path.posix : path;
}

function getExistingPathCandidate(allFiles: Set<string>, candidates: string[]): string | undefined {
	for (const candidate of candidates) {
		if (allFiles.has(candidate)) return candidate;
	}
	return undefined;
}

function tryResolve(basePath: string, allFiles: Set<string>): string | undefined {
	// 1. Direct match
	{
		const direct = getExistingPathCandidate(allFiles, [basePath, toPosixPath(basePath)]);
		if (direct) return direct;
	}

	// 2. Extensions
	for (const ext of EXTENSIONS) {
		const pathWithExt = `${basePath}${ext}`;
		const match = getExistingPathCandidate(allFiles, [pathWithExt, toPosixPath(pathWithExt)]);
		if (match) return match;
	}

	// 3. Index file
	for (const ext of EXTENSIONS) {
		const pathApi = getPathApi(basePath);
		const indexPath = pathApi.join(basePath, `index${ext}`);
		const match = getExistingPathCandidate(allFiles, [indexPath, toPosixPath(indexPath)]);
		if (match) return match;
	}

	return undefined;
}

/**
 * A simple module resolver.
 */
export function resolvePath(
	moduleSpecifier: string,
	importerPath: string,
	allFiles: Set<string>,
	aliases: ResolvedAlias[],
): string | undefined {
	const pathApi = getPathApi(importerPath);
	// 1. Try resolving aliases first
	for (const { prefix, paths } of aliases) {
		if (moduleSpecifier.startsWith(prefix)) {
			const rest = moduleSpecifier.substring(prefix.length);
			for (const p of paths) {
				const resolved = tryResolve(pathApi.join(p, rest), allFiles);
				if (resolved) return resolved;
			}
		}
	}

	// 2. Resolve relative paths
	if (moduleSpecifier.startsWith(".")) {
		const importerDir = pathApi.dirname(importerPath);
		const resolvedBase = pathApi.resolve(importerDir, moduleSpecifier);
		return tryResolve(resolvedBase, allFiles);
	}

	return undefined;
}
