import { formatNumber, formatPercentage } from "../components/stats-formatters";
import type { BenchResult, ComparisonItem } from "../types/index";

const getAverageTime = (value: BenchResult | number): number => {
	return typeof value === "number" ? value : value.averageTime;
};

const getName = (value: BenchResult | number): string | undefined => {
	return typeof value === "number" ? undefined : value.name;
};

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
export function calculateRelativePerformance(result: number, baseline: number): number;
export function calculateRelativePerformance(result: BenchResult, baseline: BenchResult): ComparisonItem;
export function calculateRelativePerformance(
	result: BenchResult | number,
	baseline: BenchResult | number,
): ComparisonItem | number {
	if (typeof result === "number" && typeof baseline === "number") {
		return baseline === 0 ? 0 : result / baseline;
	}

	const resultTime = getAverageTime(result);
	const baselineTime = getAverageTime(baseline);
	const relativeTo = baselineTime === 0 ? 0 : resultTime / baselineTime;
	const percentage = baselineTime === 0 ? 0 : ((resultTime - baselineTime) / baselineTime) * 100;
	const ratio = `${formatNumber(relativeTo, 2)}x`;

	return {
		name: getName(result) ?? "",
		relativeTo,
		percentage,
		ratio,
	};
}

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
	faster: BenchResult | number,
	slower: BenchResult | number,
): number => {
	const fasterTime = getAverageTime(faster);
	const slowerTime = getAverageTime(slower);
	return fasterTime === 0 ? 0 : slowerTime / fasterTime;
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
