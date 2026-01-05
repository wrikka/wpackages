/**
 * File discovery utility for finding test files
 */

import { glob } from "glob";

/**
 * Find test files based on include and exclude patterns
 */
export const findTestFiles = async (
	include: string[],
	exclude: string[],
	cwd: string = process.cwd(),
): Promise<string[]> => {
	return glob(include, {
		cwd,
		absolute: true,
		ignore: exclude,
	});
};
