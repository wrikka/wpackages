import type { RetryConfig } from "../types/job";
import type { PersistenceConfig } from "../types/persistence";

export interface SchedulerConfig {
	readonly persistence: PersistenceConfig;
	readonly defaultRetryConfig: RetryConfig;
	readonly maxConcurrentJobs: number;
	readonly jobTimeout: number;
	readonly lockTTL: number;
	readonly heartbeatInterval: number;
	readonly metricsRetention: number;
	readonly executionRetention: number;
	readonly timezone: string;
	readonly enableMetrics: boolean;
	readonly enableEvents: boolean;
	readonly enableWebUI: boolean;
	readonly webUIPort?: number;
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
	persistence: {
		adapter: "memory",
	},
	defaultRetryConfig: {
		maxRetries: 3,
		backoffStrategy: "exponential",
		initialDelay: 1000,
		maxDelay: 60000,
		backoffMultiplier: 2,
	},
	maxConcurrentJobs: 10,
	jobTimeout: 300000,
	lockTTL: 30000,
	heartbeatInterval: 10000,
	metricsRetention: 30 * 24 * 60 * 60 * 1000,
	executionRetention: 7 * 24 * 60 * 60 * 1000,
	timezone: "UTC",
	enableMetrics: true,
	enableEvents: true,
	enableWebUI: false,
} as const;
