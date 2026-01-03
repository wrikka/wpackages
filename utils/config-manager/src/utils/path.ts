import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Find config file in directory
 */
export const findConfigFile = (
	cwd: string,
	name: string,
	extensions: readonly string[],
): string | null => {
	for (const ext of extensions) {
		const filePath = join(cwd, `${name}.config${ext}`);
		if (existsSync(filePath)) {
			return filePath;
		}
	}
	return null;
};

/**
 * Find RC file in directory
 */
export const findRcFile = (
	cwd: string,
	name: string,
	extensions: readonly string[],
): string | null => {
	for (const ext of extensions) {
		const filePath = join(cwd, `.${name}rc${ext}`);
		if (existsSync(filePath)) {
			return filePath;
		}
	}
	return null;
};
