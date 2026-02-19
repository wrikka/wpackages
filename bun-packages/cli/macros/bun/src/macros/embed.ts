import { readdirSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";

/**
 * Embed file contents at build time.
 * The file is read during bundling and the content is inlined into your code.
 *
 * @param filePath - Relative path to the file to embed
 * @returns The file content as a JSON string
 * @throws Error if the file cannot be read
 *
 * @example
 * const content = embed("./data.json");
 * console.log(content);
 */
export const embed = Bun.macro((filePath: string) => {
	const absolutePath = resolve(import.meta.dir, "..", filePath);
	try {
		const content = readFileSync(absolutePath, "utf-8");
		return JSON.stringify(content);
	} catch (error) {
		throw new Error(
			"Failed to read file at \"" + absolutePath + "\": " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Embed multiple files matching a glob pattern at build time.
 * Supports basic glob patterns: * (any characters), ** (any directories)
 *
 * @param pattern - Glob pattern to match files
 * @returns An object mapping file paths to their contents
 * @throws Error if files cannot be read
 *
 * @example
 * // Embed all JSON files in data directory
 * const dataFiles = embedGlob("./data/*.json");
 */
// oxlint-ignore-next-line
export const embedGlob = Bun.macro((pattern: string) => {
	const baseDir = resolve(import.meta.dir, "..");
	const files: Record<string, string> = {};

	try {
		const parts = pattern.split("/");

		function walk(dir: string, remainingParts: string[]) {
			if (remainingParts.length === 0) return;

			const currentPart = remainingParts[0];
			if (!currentPart) return;

			const isLastPart = remainingParts.length === 1;

			if (currentPart === "**") {
				const entries = readdirSync(dir);
				for (const entry of entries) {
					const fullPath = join(dir, entry);
					const stat = statSync(fullPath);
					if (stat.isDirectory()) {
						walk(fullPath, remainingParts.slice(1));
					} else if (isLastPart) {
						files[fullPath] = readFileSync(fullPath, "utf-8");
					}
				}
			} else if (currentPart.includes("*")) {
				const regex = new RegExp("^" + currentPart.replace(/\*/g, ".*") + "$");
				const entries = readdirSync(dir);
				for (const entry of entries) {
					if (regex.test(entry)) {
						const fullPath = join(dir, entry);
						const stat = statSync(fullPath);
						if (stat.isDirectory() && !isLastPart) {
							walk(fullPath, remainingParts.slice(1));
						} else if (stat.isFile() && isLastPart) {
							files[fullPath] = readFileSync(fullPath, "utf-8");
						}
					}
				}
			} else {
				const fullPath = join(dir, currentPart);
				const stat = statSync(fullPath);
				if (stat.isDirectory() && !isLastPart) {
					walk(fullPath, remainingParts.slice(1));
				} else if (stat.isFile() && isLastPart) {
					files[fullPath] = readFileSync(fullPath, "utf-8");
				}
			}
		}

		walk(baseDir, parts);
		return JSON.stringify(files);
	} catch (error) {
		throw new Error(
			"Failed to embed glob pattern \"" + pattern + "\": " + (error instanceof Error ? error.message : String(error)),
		);
	}
});
