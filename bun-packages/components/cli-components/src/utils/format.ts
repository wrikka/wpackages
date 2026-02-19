/**
 * Format Utilities (Pure Functions)
 * Formatting functions for display
 */

/**
 * Format duration in milliseconds
 */
export const formatDuration = (ms: number): string => {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
	if (ms < 3600000) {
		return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
	}
	return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
};

/**
 * Format bytes to human-readable format
 */
export const formatBytes = (bytes: number): string => {
	const units = ["B", "KB", "MB", "GB", "TB"] as const;
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

/**
 * Parse flags to get option names
 */
export const parseFlags = (
	flags: string,
): { short?: string; long?: string } => {
	const parts = flags.split(",").map((s) => s.trim());
	const result: { short?: string; long?: string } = {};

	for (const part of parts) {
		if (part.startsWith("--")) {
			const long = part.slice(2).split(/[=\s]/)[0];
			if (long) result.long = long;
		} else if (part.startsWith("-")) {
			result.short = part.slice(1);
		}
	}

	return result;
};

/**
 * Convert kebab-case to camelCase
 */
export const camelCase = (str: string): string => {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};
