import { isAbsolute, normalize, relative, resolve, sep } from "node:path";

export const normalizePath = (path: string): string => normalize(path).replace(/\\/g, "/");

export const resolvePath = (path: string): string => resolve(path).replace(/\\/g, "/");

export const getRelativePath = (from: string, to: string): string => relative(from, to).replace(/\\/g, "/");

export const isAbsolutePath = (path: string): boolean => isAbsolute(path);

export const joinPaths = (...paths: readonly string[]): string => paths.join(sep).replace(/\\/g, "/");

export const getPathDepth = (path: string): number => {
	const normalized = normalizePath(path);
	return normalized.split("/").filter(Boolean).length;
};

export const isSubPath = (parent: string, child: string): boolean => {
	// If paths are identical, child is not a sub-path of parent
	if (parent === child) return false;

	const rel = getRelativePath(parent, child);
	return !rel.startsWith("..") && !isAbsolutePath(rel);
};
