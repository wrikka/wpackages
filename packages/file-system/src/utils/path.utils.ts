import { basename, dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import type { PathInfo } from "../types/fs";

// Join paths
export const joinPaths = (...paths: readonly string[]): string => {
	return join(...paths);
};

// Get directory name
export const getDirname = (path: string): string => {
	return dirname(path);
};

// Get base name
export const getBasename = (path: string, ext?: string): string => {
	return basename(path, ext);
};

// Get extension
export const getExtname = (path: string): string => {
	return extname(path);
};

// Get filename without extension
export const getFilename = (path: string): string => {
	const ext = extname(path);
	return basename(path, ext);
};

// Parse path
export const parsePath = (path: string): PathInfo => {
	return {
		basename: basename(path),
		dirname: dirname(path),
		extname: extname(path),
		filename: getFilename(path),
	};
};

// Resolve path
export const resolvePath = (...paths: readonly string[]): string => {
	return resolve(...paths);
};

// Get relative path
export const getRelativePath = (from: string, to: string): string => {
	return relative(from, to);
};

// Normalize path
export const normalizePath = (path: string): string => {
	return normalize(path);
};

// Check if absolute path
export const isAbsolutePath = (path: string): boolean => {
	return path.startsWith("/") || /^[a-zA-Z]:/.test(path);
};

// Get path separator
export const getPathSeparator = (): string => {
	return sep;
};
