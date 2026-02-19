/**
 * Re-export statistics utilities
 */
export type { Statistics } from "../types/stats.types";

export {
	calculatePercentiles,
	calculateStatistics,
	mean,
	median,
	opsPerSecond,
	percentile,
	standardDeviation,
	variance,
	welchTTest,
} from "./stats-core";

export { formatNumber, formatOps, formatPercentage, formatTime } from "../components/stats-formatters";
