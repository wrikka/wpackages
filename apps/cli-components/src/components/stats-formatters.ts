import { PERCENTAGE_DECIMALS, PRECISION_DECIMALS } from "../constant/stats.const";

/**
 * Format number with precision
 */
export const formatNumber = (
	num: number,
	decimals: number = PRECISION_DECIMALS,
): string => {
	return num.toFixed(decimals);
};

/**
 * Format percentage
 */
export const formatPercentage = (
	num: number,
	decimals: number = PERCENTAGE_DECIMALS,
): string => {
	return `${num.toFixed(decimals)}%`;
};

/**
 * Format time (ms, s, μs)
 */
export const formatTime = (ms: number): string => {
	if (ms < 1) {
		return `${formatNumber(ms * 1000, 2)}μs`;
	}
	if (ms < 1000) {
		return `${formatNumber(ms, PRECISION_DECIMALS)}ms`;
	}
	return `${formatNumber(ms / 1000, 2)}s`;
};

/**
 * Format operations per second
 */
export const formatOps = (ops: number): string => {
	if (ops >= 1_000_000) {
		return `${formatNumber(ops / 1_000_000, 2)}M ops/s`;
	}
	if (ops >= 1_000) {
		return `${formatNumber(ops / 1_000, 2)}K ops/s`;
	}
	return `${formatNumber(ops, 2)} ops/s`;
};

/**
 * Format bytes (B, KB, MB, GB)
 */
export const formatBytes = (bytes: number): string => {
	const units = ["B", "KB", "MB", "GB"];
	let value = bytes;
	let unitIndex = 0;

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex++;
	}

	return `${formatNumber(value, 2)} ${units[unitIndex]}`;
};
