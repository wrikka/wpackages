import { readdirSync } from "node:fs";
import { homedir } from "node:os";
import { copyFile, ensureDir, fileExists, removeFile } from "../utils";

export const FileSystemService = {
	/**
	 * List files in directory
	 */
	listFiles: (path: string): string[] => {
		try {
			return readdirSync(path);
		} catch {
			return [];
		}
	},

	/**
	 * List files in home directory
	 */
	listHomeFiles: (): string[] => {
		return FileSystemService.listFiles(homedir());
	},

	/**
	 * Copy file
	 */
	copyFile,

	/**
	 * Ensure directory exists
	 */
	ensureDir,

	/**
	 * Remove file
	 */
	removeFile,

	/**
	 * Check if file exists
	 */
	fileExists,
};
