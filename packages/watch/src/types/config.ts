import type { ErrorHandler, WatchFilter, WatchHandler, WatchStats, WatchEvent } from "./events";
import type { AdvancedPatternMatcher } from "../services/advanced-matcher";

export type WatchOptions = {
	readonly persistent?: boolean;
	readonly recursive?: boolean;
	readonly encoding?: BufferEncoding;
	readonly signal?: AbortSignal;
};

export type WatcherConfig = {
	readonly paths: readonly string[];
	readonly options?: WatchOptions;
	readonly ignored?: readonly string[] | WatchFilter;
	readonly ignoreInitial?: boolean;
	readonly debounceMs?: number;
	readonly enableStats?: boolean;
	readonly enableHotReload?: boolean;
	readonly awaitWriteFinish?:
		| boolean
		| {
			readonly stabilityThreshold?: number;
			readonly pollInterval?: number;
		};
	readonly usePolling?: boolean;
	readonly pollingInterval?: number;
	readonly atomic?: boolean;
	readonly followSymlinks?: boolean;
	readonly depth?: number;
	readonly handler?: WatchHandler;
	readonly errorHandler?: ErrorHandler;
};

export type PerformanceStats = {
	readonly uptime: number;
	readonly eventCount: number;
	readonly eventsPerSecond: number;
	readonly avgProcessingTime: number;
	readonly maxProcessingTime: number;
	readonly minProcessingTime: number;
	readonly eventsByType: Record<string, number>;
	readonly totalProcessingTime: number;
};

export type WatcherInstance = {
	readonly start: () => Promise<void>;
	readonly stop: () => Promise<void>;
	readonly add: (paths: string | readonly string[]) => Promise<void>;
	readonly unwatch: (paths: string | readonly string[]) => Promise<void>;
	readonly getStats: () => WatchStats;
	readonly isWatching: () => boolean;
	readonly on: (event: string, handler: WatchHandler) => void;
	readonly once: (event: string, handler: WatchHandler) => void;
	readonly off: (event: string, handler?: WatchHandler) => void;
	// Advanced features
	readonly getPerformanceStats: () => PerformanceStats;
	readonly getPerformanceRecommendations: () => string[];
	readonly onHotReload: (callback: (event: WatchEvent) => void | Promise<void>) => void;
	readonly getAdvancedPatternMatcher: () => AdvancedPatternMatcher | null;
};
