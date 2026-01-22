/**
 * Statistics result type
 */
export interface Statistics {
	min: number;
	max: number;
	mean: number;
	median: number;
	variance: number;
	standardDeviation: number;
	marginOfError: number;
	relativeMarginOfError: number;
}

/**
 * Percentiles result type
 */
export interface Percentiles {
	p25: number;
	p50: number;
	p75: number;
	p90: number;
	p95: number;
	p99: number;
}

/**
 * Confidence level for statistical calculations
 */
export type ConfidenceLevel = 0.95 | 0.99;
