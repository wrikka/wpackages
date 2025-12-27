import pc from "picocolors";
import type { FileMapping } from "../types";

/**
 * Format file list for display
 */
export const formatFileList = (files: FileMapping[], prefix = "  "): string => {
	return files.map((f) => `${prefix}${pc.green("✔")} ${f.source}`).join("\n");
};

/**
 * Format skipped files for display
 */
export const formatSkippedFiles = (files: string[], prefix = "  "): string => {
	return files.map((f) => `${prefix}${pc.yellow("✖")} ${f}`).join("\n");
};

/**
 * Check if file list is empty
 */
export const isFileListEmpty = (files: FileMapping[]): boolean => {
	return files.length === 0;
};

/**
 * Count files by status
 */
export const countFiles = (files: FileMapping[]) => {
	return {
		total: files.length,
		isEmpty: files.length === 0,
	};
};
