import { glob } from "node:fs/promises";
import { join } from "node:path";

/**
 * Collects all files matching the given glob patterns
 * Pure function for file globbing
 *
 * @param patterns - Array of glob patterns to match
 * @param cwd - Current working directory (defaults to process.cwd())
 * @returns Promise resolving to array of absolute file paths
 */
export const collectFiles = async (
	patterns: string[],
	cwd: string = process.cwd(),
): Promise<string[]> => {
	const filePromises = patterns.map(async (pattern) => {
		const matches: string[] = [];
		for await (const file of glob(pattern, { cwd })) {
			matches.push(join(cwd, file));
		}
		return matches;
	});

	const fileArrays = await Promise.all(filePromises);
	return fileArrays.flat();
};
