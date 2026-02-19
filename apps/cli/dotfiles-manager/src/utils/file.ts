import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Ensure directory exists, create if not
 */
export const ensureDir = (path: string): void => {
	if (!existsSync(path)) {
		mkdirSync(path, { recursive: true });
	}
};

/**
 * Copy file to destination, creating directories as needed
 */
export const copyFile = (source: string, target: string): void => {
	ensureDir(dirname(target));
	copyFileSync(source, target);
};

/**
 * Remove file if exists
 */
export const removeFile = (path: string): void => {
	if (existsSync(path)) {
		rmSync(path);
	}
};

/**
 * Check if file exists
 */
export const fileExists = (path: string): boolean => {
	return existsSync(path);
};
