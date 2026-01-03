import { Z_SCORE_95, Z_SCORE_99 } from "../constant/stats.const";
import type { ConfidenceLevel, Percentiles, Statistics } from "../types/stats.types";

/**
 * Calculate mean (average)
 */
export const mean = (values: readonly number[]): number => {
	if (values.length === 0) return 0;
	const sum = values.reduce((acc, val) => acc + val, 0);
	return sum / values.length;
};

/**
 * Calculate minimum value
 */
export const min = (values: readonly number[]): number => {
	if (values.length === 0) return 0;
	return Math.min(...values);
};

/**
 * Calculate maximum value
 */
export const max = (values: readonly number[]): number => {
	if (values.length === 0) return 0;
	return Math.max(...values);
};

/**
 * Calculate median
 */
export const median = (values: readonly number[]): number => {
	if (values.length === 0) return 0;

	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);

	if (sorted.length % 2 === 0) {
		const lower = sorted[mid - 1];
		const upper = sorted[mid];
		if (lower === undefined || upper === undefined) return 0;
		return (lower + upper) / 2;
	}

	const value = sorted[mid];
	return value ?? 0;
};

/**
 * Calculate variance
 */
export const variance = (values: readonly number[]): number => {
	if (values.length === 0) return 0;

	const avg = mean(values);
	const squaredDiffs = values.map((v) => (v - avg) ** 2);

	return mean(squaredDiffs);
};

/**
 * Calculate standard deviation
 */
export const standardDeviation = (values: readonly number[]): number => {
	return Math.sqrt(variance(values));
};

/**
 * Calculate standard error
 */
export const standardError = (values: readonly number[]): number => {
	if (values.length === 0) return 0;
	return standardDeviation(values) / Math.sqrt(values.length);
};

/**
 * Calculate margin of error
 */
export const marginOfError = (
	values: readonly number[],
	confidenceLevel: ConfidenceLevel = 0.95,
): number => {
	const zScore = confidenceLevel === 0.95 ? Z_SCORE_95 : Z_SCORE_99;
	return zScore * standardError(values);
};

/**
 * Calculate relative margin of error (as percentage)
 */
export const relativeMarginOfError = (
	values: readonly number[],
	confidenceLevel: ConfidenceLevel = 0.95,
): number => {
	const moe = marginOfError(values, confidenceLevel);
	const avg = mean(values);
	return avg === 0 ? 0 : (moe / avg) * 100;
};

/**
 * Calculate percentile
 */
export const percentile = (values: readonly number[], p: number): number => {
	if (values.length === 0) return 0;
	if (p < 0 || p > 100) return 0;

	const sorted = [...values].sort((a, b) => a - b);
	const index = (p / 100) * (sorted.length - 1);
	const lower = Math.floor(index);
	const upper = Math.ceil(index);
	const weight = index - lower;

	if (lower === upper) {
		const value = sorted[lower];
		return value ?? 0;
	}

	const lowerValue = sorted[lower];
	const upperValue = sorted[upper];
	if (lowerValue === undefined || upperValue === undefined) return 0;

	return lowerValue * (1 - weight) + upperValue * weight;
};

/**
 * Calculate all percentiles
 */
export const calculatePercentiles = (
	values: readonly number[],
): Percentiles => {
	return {
		p25: percentile(values, 25),
		p50: percentile(values, 50),
		p75: percentile(values, 75),
		p90: percentile(values, 90),
		p95: percentile(values, 95),
		p99: percentile(values, 99),
	};
};

/**
 * Calculate all statistics
 */
export const calculateStatistics = (
	values: readonly number[],
	confidenceLevel: ConfidenceLevel = 0.95,
): Statistics => {
	return {
		min: min(values),
		max: max(values),
		mean: mean(values),
		median: median(values),
		variance: variance(values),
		standardDeviation: standardDeviation(values),
		marginOfError: marginOfError(values, confidenceLevel),
		relativeMarginOfError: relativeMarginOfError(values, confidenceLevel),
	};
};

/**
 * Calculate operations per second
 */
export const opsPerSecond = (avgTimeMs: number): number => {
	if (avgTimeMs === 0) return 0;
	return 1000 / avgTimeMs;
};
