/**
 * File utilities
 */

import { IGNORE_DIRECTORIES, isJavaScriptFile, isTypeScriptFile } from "../constant/extensions.const";

export const isLintableFile = (filename: string): boolean => isTypeScriptFile(filename) || isJavaScriptFile(filename);

export const shouldIgnoreDirectory = (dirname: string): boolean =>
	IGNORE_DIRECTORIES.some((ignored) => dirname === ignored);

export const normalizePath = (path: string): string => path.replace(/\\/g, "/");

export const getRelativePath = (from: string, to: string): string => {
	const fromParts = normalizePath(from).split("/");
	const toParts = normalizePath(to).split("/");

	let commonLength = 0;
	const minLength = Math.min(fromParts.length, toParts.length);

	for (let i = 0; i < minLength; i++) {
		if (fromParts[i] === toParts[i]) {
			commonLength++;
		} else {
			break;
		}
	}

	const upCount = fromParts.length - commonLength;
	const ups = Array(upCount).fill("..").join("/");
	const remaining = toParts.slice(commonLength).join("/");

	return ups ? `${ups}/${remaining}` : remaining;
};

export const getExtension = (filename: string): string => {
	const lastDot = filename.lastIndexOf(".");
	return lastDot === -1 ? "" : filename.slice(lastDot);
};

export const getBasename = (path: string): string => {
	const normalized = normalizePath(path);
	const lastSlash = normalized.lastIndexOf("/");
	return lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1);
};
