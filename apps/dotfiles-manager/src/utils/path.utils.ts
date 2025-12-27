import { homedir } from "node:os";
import { relative, resolve } from "node:path";

/**
 * Expand ~ to home directory
 */
export const expandHome = (path: string): string => {
	return path.replace("~", homedir());
};

/**
 * Normalize file path
 */
export const normalizePath = (path: string): string => {
	return resolve(expandHome(path));
};

/**
 * Get relative path from home directory
 */
export const getRelativeFromHome = (path: string): string => {
	const normalized = normalizePath(path);
	return relative(homedir(), normalized);
};

/**
 * Check if path is in home directory
 */
export const isInHomeDir = (path: string): boolean => {
	const normalized = normalizePath(path);
	return normalized.startsWith(homedir());
};

/**
 * Get display path (with ~ if in home directory)
 */
export const getDisplayPath = (path: string): string => {
	const normalized = normalizePath(path);
	if (isInHomeDir(normalized)) {
		return `~/${getRelativeFromHome(normalized)}`;
	}
	return normalized;
};
