/**
 * Normalize a path to use forward slashes
 */
export const normalizePath = (path: string): string => {
	return path.replace(/\\/g, "/");
};

/**
 * Check if a path is a subpath of another path
 */
export const isSubPath = (parent: string, child: string): boolean => {
	const normalizedParent = normalizePath(parent);
	const normalizedChild = normalizePath(child);

	return normalizedChild.startsWith(normalizedParent);
};
