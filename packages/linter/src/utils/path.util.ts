/**
 * Path utilities - Pure functions for path manipulation
 */

/**
 * Join path segments
 */
export const join = (...segments: string[]): string =>
	segments
		.map((segment) => segment.replace(/^\/+|\/+$/g, ""))
		.filter(Boolean)
		.join("/");

/**
 * Get directory name from path
 */
export const dirname = (path: string): string => {
	const parts = path.split("/");
	return parts.slice(0, -1).join("/");
};

/**
 * Get basename from path
 */
export const basename = (path: string): string => {
	const parts = path.split("/");
	return parts[parts.length - 1] || "";
};

/**
 * Check if path is absolute
 */
export const isAbsolute = (path: string): boolean => path.startsWith("/");

/**
 * Normalize path (remove redundant separators)
 */
export const normalize = (path: string): string => path.replace(/\/+/g, "/").replace(/\/$/, "");

/**
 * Get relative path from base to target
 */
export const relative = (from: string, to: string): string => {
	const fromParts = normalize(from).split("/");
	const toParts = normalize(to).split("/");

	// Find common prefix
	let commonLength = 0;
	for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
		if (fromParts[i] === toParts[i]) {
			commonLength++;
		} else {
			break;
		}
	}

	// Go up from common directory
	const upLevels = fromParts.length - commonLength;
	const upSegments = Array(upLevels).fill("..");

	// Add remaining target parts
	const remainingParts = toParts.slice(commonLength);

	return join(...upSegments, ...remainingParts);
};

/**
 * Check if path matches pattern
 */
export const matchesPattern = (path: string, pattern: string): boolean => {
	const regexPattern = pattern
		.replace(/\./g, "\\.")
		.replace(/\*/g, ".*")
		.replace(/\?/g, ".");
	const regex = new RegExp(`^${regexPattern}$`);
	return regex.test(path);
};
