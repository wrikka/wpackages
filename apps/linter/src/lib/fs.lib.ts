/**
 * File System wrapper - Functional interface for file operations
 *
 * Provides pure functions and Effect-based operations for file system
 */

import { Effect } from "effect";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

/**
 * Pure file operations (synchronous)
 */
export const FsPure = {
	/**
	 * Check if file exists
	 */
	exists: (path: string): boolean => existsSync(path),

	/**
	 * Read file content as string
	 */
	readText: (path: string): string => {
		try {
			return readFileSync(path, "utf-8");
		} catch {
			throw new Error(`Failed to read file: ${path}`);
		}
	},

	/**
	 * Write string content to file
	 */
	writeText: (path: string, content: string): void => {
		try {
			writeFileSync(path, content, "utf-8");
		} catch {
			throw new Error(`Failed to write file: ${path}`);
		}
	},

	/**
	 * Get file extension
	 */
	getExtension: (path: string): string => {
		const match = path.match(/\.([^.]+)$/);
		return match?.[1] ?? "";
	},

	/**
	 * Check if path is a file based on extension
	 */
	isFile: (path: string, extensions?: string[]): boolean => {
		const ext = FsPure.getExtension(path);
		if (!ext) return false;
		if (!extensions) return true;
		return extensions.includes(ext);
	},
};

/**
 * Effect-based file operations
 */
export const FsEffect = {
	/**
	 * Read file with Effect
	 */
	readText: (path: string) => Effect.try(() => FsPure.readText(path)),

	/**
	 * Write file with Effect
	 */
	writeText: (path: string, content: string) =>
		Effect.try(() => FsPure.writeText(path, content)),

	/**
	 * Check if file exists with Effect
	 */
	exists: (path: string) => Effect.succeed(FsPure.exists(path)),
};

/**
 * File type utilities
 */
export const FileTypes = {
	// Common file extensions
	typescript: ["ts", "tsx"],
	javascript: ["js", "jsx"],
	json: ["json"],
	markdown: ["md", "mdx"],

	/**
	 * Check if file is TypeScript
	 */
	isTypeScript: (path: string): boolean =>
		FsPure.isFile(path, FileTypes.typescript),

	/**
	 * Check if file is JavaScript
	 */
	isJavaScript: (path: string): boolean =>
		FsPure.isFile(path, FileTypes.javascript),

	/**
	 * Check if file is JSON
	 */
	isJson: (path: string): boolean => FsPure.isFile(path, FileTypes.json),

	/**
	 * Check if file is Markdown
	 */
	isMarkdown: (path: string): boolean =>
		FsPure.isFile(path, FileTypes.markdown),

	/**
	 * Check if file is source code (TS/JS)
	 */
	isSourceCode: (path: string): boolean =>
		FileTypes.isTypeScript(path) || FileTypes.isJavaScript(path),
};
