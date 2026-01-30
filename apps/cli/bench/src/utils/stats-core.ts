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
		const val1 = sorted[mid - 1];
		const val2 = sorted[mid];
		if (val1 !== undefined && val2 !== undefined) {
			return (val1 + val2) / 2;
		}
		return 0;
	}

	const result = sorted[mid];
	return result ?? 0;
};

/**
 * Calculate variance
 */
export const variance = (values: readonly number[]): number => {
	const n = values.length;
	if (n < 2) return 0;

	const avg = mean(values);
	const sumOfSquaredDiffs = values.reduce((acc, val) => acc + (val - avg) ** 2, 0);

	return sumOfSquaredDiffs / (n - 1);
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
		const result = sorted[lower];
		return result ?? 0;
	}

	const lowerVal = sorted[lower];
	const upperVal = sorted[upper];

	if (lowerVal !== undefined && upperVal !== undefined) {
		return lowerVal * (1 - weight) + upperVal * weight;
	}

	return 0;
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

// The following code for the regularized incomplete beta function and its dependencies
// is adapted from public domain implementations or those with compatible licenses (e.g., MIT).
// It's included to avoid external dependencies for statistical calculations.

const logGamma = (x: number): number => {
	const g = 7;
	const p = [
		0.9999999999998099,
		676.5203681218851,
		-1259.1392167224028,
		771.3234287776531,
		-176.6150291621406,
		12.507343278686905,
		-0.13857109526572012,
		9.984369578019572e-6,
		1.5056327351493116e-7,
	];
	if (x < 0.5) {
		return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - logGamma(1 - x);
	}
	x -= 1;
	let a = p[0]!;
	const t = x + g + 0.5;
	for (let i = 1; i < p.length; i++) {
		a += p[i]! / (x + i);
	}
	return Math.log(Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a);
};

const incompleteBeta = (x: number, a: number, b: number): number => {
	if (x <= 0) return 0;
	if (x >= 1) return 1;

	const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
	if (x < (a + 1) / (a + b + 2)) {
		return bt * continuedFraction(x, a, b) / a;
	}
	return 1 - bt * continuedFraction(1 - x, b, a) / b;
};

const continuedFraction = (x: number, a: number, b: number): number => {
	// Standard continued fraction for incomplete beta using Lentz's method (Numerical Recipes)
	const maxIterations = 200;
	const eps = 3e-7;
	const fpmin = 1e-30;

	const qab = a + b;
	const qap = a + 1;
	const qam = a - 1;

	let c = 1;
	let d = 1 - (qab * x) / qap;
	if (Math.abs(d) < fpmin) d = fpmin;
	d = 1 / d;
	let h = d;

	for (let m = 1; m <= maxIterations; m++) {
		const m2 = 2 * m;

		let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
		d = 1 + aa * d;
		if (Math.abs(d) < fpmin) d = fpmin;
		c = 1 + aa / c;
		if (Math.abs(c) < fpmin) c = fpmin;
		d = 1 / d;
		h *= d * c;

		aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
		d = 1 + aa * d;
		if (Math.abs(d) < fpmin) d = fpmin;
		c = 1 + aa / c;
		if (Math.abs(c) < fpmin) c = fpmin;
		d = 1 / d;
		const del = d * c;
		h *= del;

		if (Math.abs(del - 1) < eps) {
			break;
		}
	}

	return h;
};

const tTestPValue = (t: number, df: number): number => {
	const x = df / (df + t * t);
	return incompleteBeta(x, df / 2, 0.5);
};

/**
 * Performs Welch's t-test for two independent samples.
 * @returns The p-value, or null if the test cannot be performed.
 */
export const welchTTest = (
	sample1: readonly number[],
	sample2: readonly number[],
): { t: number; df: number; p: number } | null => {
	const n1 = sample1.length;
	const n2 = sample2.length;
	if (n1 < 2 || n2 < 2) return null;

	const mean1 = mean(sample1);
	const mean2 = mean(sample2);
	const v1 = variance(sample1);
	const v2 = variance(sample2);

	const t = (mean1 - mean2) / Math.sqrt(v1 / n1 + v2 / n2);
	const dfNumerator = (v1 / n1 + v2 / n2) ** 2;
	const dfDenominator = ((v1 / n1) ** 2) / (n1 - 1) + ((v2 / n2) ** 2) / (n2 - 1);
	const df = dfNumerator / dfDenominator;

	const pRaw = tTestPValue(Math.abs(t), df);
	const p = Math.min(1, Math.max(0, pRaw));

	return { t, df, p };
};
