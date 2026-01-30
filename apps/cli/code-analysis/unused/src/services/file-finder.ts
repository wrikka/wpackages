import { glob } from "glob";
import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_IGNORE = ["**/node_modules/**", "**/dist/**", "**/.*/**"];

async function readGitIgnorePatterns(cwd: string): Promise<string[]> {
	try {
		const gitignorePath = path.join(cwd, ".gitignore");
		const content = await fs.readFile(gitignorePath, "utf-8");
		return content
			.split(/\r?\n/)
			.map(line => line.trim())
			.filter(line => line.length > 0)
			.filter(line => !line.startsWith("#"))
			.map(p => {
				const normalized = p.replace(/\\/g, "/");
				if (normalized.startsWith("!")) {
					return normalized;
				}
				if (normalized.startsWith("/")) {
					return `**${normalized}`;
				}
				return `**/${normalized}`;
			});
	} catch {
		return [];
	}
}

/**
 * Finds all relevant source files in the project using glob patterns.
 * @param cwd The directory to search in.
 * @param userIgnore Custom ignore patterns.
 * @returns A promise that resolves to an array of absolute file paths.
 */
export async function findSourceFiles(cwd: string, userIgnore: string[] = []): Promise<string[]> {
	const patterns = ["**/*.{js,jsx,ts,tsx}"];
	const gitignore = await readGitIgnorePatterns(cwd);
	const ignore = [...DEFAULT_IGNORE, ...gitignore, ...userIgnore];

	const results = await Promise.all(
		patterns.map(pattern => glob(pattern, { cwd, ignore, absolute: true, nodir: true })),
	);

	return results.flat();
}
