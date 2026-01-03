import type { Logger } from "../utils/logger";
import { getPerformanceRecommendations } from "./performance-recommendations";

export type PerformanceStats = {
	readonly startTime: number;
	readonly totalReloads: number;
	readonly totalFileEvents: number;
	readonly averageReloadTime: number;
	readonly maxReloadTime: number;
	readonly minReloadTime: number;
	readonly watchedFiles: number;
};

export type PerformanceMonitor = {
	readonly start: () => void;
	readonly stop: () => void;
	readonly reset: () => void;
	readonly recordReload: (duration: number) => void;
	readonly recordFileEvent: () => void;
	readonly getStats: () => PerformanceStats;
	readonly getRecommendations: () => string[];
};

export const createPerformanceMonitor = (
	logger: Logger,
): PerformanceMonitor => {
	const startTime = Date.now();
	let totalReloads = 0;
	let totalFileEvents = 0;
	let totalReloadTime = 0;
	let maxReloadTime = 0;
	let minReloadTime = Infinity;
	let watchedFiles = 0;

	const start = (): void => {
		logger.info("Performance monitoring started");
	};

	const stop = (): void => {
		logger.info("Performance monitoring stopped");
	};

	const reset = (): void => {
		totalReloads = 0;
		totalFileEvents = 0;
		totalReloadTime = 0;
		maxReloadTime = 0;
		minReloadTime = Infinity;
		watchedFiles = 0;
		logger.info("Performance metrics reset");
	};

	const recordReload = (duration: number): void => {
		totalReloads++;
		totalReloadTime += duration;
		maxReloadTime = Math.max(maxReloadTime, duration);
		minReloadTime = Math.min(minReloadTime, duration);
	};

	const recordFileEvent = (): void => {
		totalFileEvents++;
	};

	const getStats = (): PerformanceStats => ({
		startTime,
		totalReloads,
		totalFileEvents,
		averageReloadTime: totalReloads > 0 ? totalReloadTime / totalReloads : 0,
		maxReloadTime,
		minReloadTime: minReloadTime === Infinity ? 0 : minReloadTime,
		watchedFiles,
	});

	const getRecommendations = (): string[] => {
		return getPerformanceRecommendations(getStats());
	};

	return {
		start,
		stop,
		reset,
		recordReload,
		recordFileEvent,
		getStats,
		getRecommendations,
	};
};
