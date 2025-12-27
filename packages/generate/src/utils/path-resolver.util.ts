import { basename, dirname, extname, join } from "node:path";
import type { CaseStyle } from "../types";
import { convertCase } from "./case-converter.util";

/**
 * Resolve output file path with case conversion
 */
export const resolveOutputPath = (
	outputDir: string,
	fileName: string,
	caseStyle: CaseStyle = "kebab",
	extension = ".ts",
): string => {
	const nameWithoutExt = basename(fileName, extname(fileName));
	const convertedName = convertCase(nameWithoutExt, caseStyle);
	const finalName = `${convertedName}${extension}`;

	return join(outputDir, finalName);
};

/**
 * Resolve directory path for generated files
 */
export const resolveDirectoryPath = (
	baseDir: string,
	...segments: string[]
): string => {
	return join(baseDir, ...segments);
};

/**
 * Extract file name without extension
 */
export const getFileNameWithoutExtension = (filePath: string): string => {
	return basename(filePath, extname(filePath));
};

/**
 * Get directory path from file path
 */
export const getDirectoryPath = (filePath: string): string => {
	return dirname(filePath);
};

/**
 * Normalize path separators
 */
export const normalizePath = (filePath: string): string => {
	return filePath.replace(/\\/g, "/");
};
