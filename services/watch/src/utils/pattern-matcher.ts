import { patterns } from "@w/design-pattern";
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
	globPatterns: readonly GlobPattern[],
): boolean => {
	const normalizedPath = path.replace(/\\/g, "/");

	const matcher = patterns.behavioral.conditionalSelector.createSelector<string, boolean>(
		globPatterns.map(pattern => ({
			condition: (p: string) => matchPattern(p, pattern),
			result: true,
		})),
		false,
	);

	return matcher(normalizedPath);
};
