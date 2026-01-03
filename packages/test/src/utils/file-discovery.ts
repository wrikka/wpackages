/**
 * File discovery utility for finding test files
 */

import { Glob } from "bun";

/**
 * Find test files based on include and exclude patterns
 */
export const findTestFiles = async (
	include: string[],
	exclude: string[],
	cwd: string = process.cwd(),
): Promise<string[]> => {
	const files = new Set<string>();

	for (const pattern of include) {
		const glob = new Glob(pattern);
		for await (const file of glob.scan({ cwd, absolute: true })) {
			files.add(file);
		}
	}

	for (const pattern of exclude) {
		const glob = new Glob(pattern);
		for await (const file of glob.scan({ cwd, absolute: true })) {
			if (files.has(file)) {
				files.delete(file);
			}
		}
	}

	return Array.from(files);
};
