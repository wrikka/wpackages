/**
 * Default benchmark configuration
 */
export const DEFAULT_ITERATIONS = 1000 as const;
export const DEFAULT_WARMUP = 10 as const;
export const DEFAULT_TIMEOUT = 30000 as const;
export const DEFAULT_MIN_SAMPLES = 5 as const;
export const DEFAULT_MAX_SAMPLES = 100 as const;

/**
 * Statistical constants
 */
export const Z_SCORE_95 = 1.96 as const; // 95% confidence interval
export const Z_SCORE_99 = 2.576 as const; // 99% confidence interval

/**
 * Performance thresholds
 */
export const SLOW_THRESHOLD_MS = 100 as const;
export const VERY_SLOW_THRESHOLD_MS = 1000 as const;

/**
 * Output constants
 */
export const PRECISION_DECIMALS = 4 as const;
export const PERCENTAGE_DECIMALS = 2 as const;

/**
 * Symbols
 */
export const SYMBOLS = {
	fastest: "🚀",
	slowest: "🐌",
	warning: "⚠️",
	success: "✓",
	error: "✗",
	info: "ℹ",
} as const;
