import { COMMON_EXTENSIONS } from "../constant/defaults.const";

/**
 * Extract file extension from filename
 * Pure function - no side effects
 */
export const getExtension = (filename: string): string | null => {
	const match = filename.toLowerCase().match(/\.[^.]+$/);
	return match?.[0] ?? null;
};

/**
 * Check if extension is in a category
 * Pure function - no side effects
 */
export const isExtensionInCategory = (
	extension: string | null,
	category: readonly string[],
): boolean => {
	if (!extension) return false;
	return category.includes(extension);
};

/**
 * Get category for a filename
 * Pure function - no side effects
 */
export const getFileCategory = (
	filename: string,
	categories: typeof COMMON_EXTENSIONS = COMMON_EXTENSIONS,
): keyof typeof COMMON_EXTENSIONS | null => {
	const ext = getExtension(filename);
	if (!ext) return null;

	const categoryEntries = Object.entries(categories) as Array<
		[keyof typeof COMMON_EXTENSIONS, readonly string[]]
	>;

	for (const [key, extensions] of categoryEntries) {
		if (extensions.includes(ext)) {
			return key;
		}
	}
	return null;
};
