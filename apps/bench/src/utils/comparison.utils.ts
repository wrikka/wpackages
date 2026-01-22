import { formatNumber, formatPercentage } from "../components/stats-formatters";
import type { BenchResult, ComparisonItem } from "../types/index";

/**
 * Find fastest benchmark
 */
export const findFastest = (
	results: readonly BenchResult[],
): BenchResult | undefined => {
	if (results.length === 0) return undefined;
	return results.reduce((fastest, current) => current.averageTime < fastest.averageTime ? current : fastest);
};

/**
 * Find slowest benchmark
 */
export const findSlowest = (
	results: readonly BenchResult[],
): BenchResult | undefined => {
	if (results.length === 0) return undefined;
	return results.reduce((slowest, current) => current.averageTime > slowest.averageTime ? current : slowest);
};

/**
 * Calculate relative performance
 */
export const calculateRelativePerformance = (
	result: BenchResult,
	baseline: BenchResult,
): ComparisonItem => {
	const relativeTo = result.averageTime / baseline.averageTime;
	const percentage = ((result.averageTime - baseline.averageTime) / baseline.averageTime) * 100;
	const ratio = `${formatNumber(relativeTo, 2)}x`;

	return {
		name: result.name,
		relativeTo,
		percentage,
		ratio,
	};
};

/**
 * Sort results by performance (fastest first)
 */
export const sortByPerformance = (
	results: readonly BenchResult[],
): readonly BenchResult[] => {
	return [...results].sort((a, b) => a.averageTime - b.averageTime);
};

/**
 * Group results by performance tier
 */
export const groupByPerformanceTier = (
	results: readonly BenchResult[],
): {
	fast: readonly BenchResult[];
	medium: readonly BenchResult[];
	slow: readonly BenchResult[];
} => {
	const fastest = findFastest(results);
	if (!fastest) {
		return { fast: [], medium: [], slow: [] };
	}

	const threshold1 = fastest.averageTime * 1.5;
	const threshold2 = fastest.averageTime * 3;

	return {
		fast: results.filter((r) => r.averageTime <= threshold1),
		medium: results.filter(
			(r) => r.averageTime > threshold1 && r.averageTime <= threshold2,
		),
		slow: results.filter((r) => r.averageTime > threshold2),
	};
};

/**
 * Calculate speedup factor between two benchmark results
 */
export const calculateSpeedup = (
	faster: BenchResult,
	slower: BenchResult,
): number => {
	return slower.averageTime / faster.averageTime;
};

/**
 * Format comparison ratio
 */
export const formatRatio = (relativeTo: number): string => {
	if (relativeTo < 1) {
		return `${formatNumber(1 / relativeTo, 2)}x faster`;
	}
	if (relativeTo === 1) {
		return "same speed";
	}
	return `${formatNumber(relativeTo, 2)}x slower`;
};

/**
 * Calculate percentage difference
 */
export const percentageDifference = (
	value: number,
	baseline: number,
): string => {
	if (baseline === 0) return "N/A";
	const diff = ((value - baseline) / baseline) * 100;
	const sign = diff >= 0 ? "+" : "";
	return `${sign}${formatPercentage(diff)}`;
};
