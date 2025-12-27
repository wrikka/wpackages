import { globToRegex } from "./glob-to-regex";

type GlobPattern = string;

export const createPatternMatcher = (patterns: readonly string[]) => {
	const regexPatterns = patterns.map(globToRegex);

	return (path: string): boolean => {
		const normalizedPath = path.replace(/\\/g, "/");
		return regexPatterns.some((regex) => regex.test(normalizedPath));
	};
};

export const matchPattern = (path: string, pattern: GlobPattern): boolean => {
	const regex = globToRegex(pattern);
	const normalizedPath = path.replace(/\\/g, "/");
	return regex.test(normalizedPath);
};

export const matchAnyPattern = (
	path: string,
	patterns: readonly GlobPattern[],
): boolean => {
	const normalizedPath = path.replace(/\\/g, "/");
	return patterns.some((pattern) => matchPattern(normalizedPath, pattern));
};
