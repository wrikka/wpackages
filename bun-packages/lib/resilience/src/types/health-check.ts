/**
 * Health check types
 */

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export type HealthCheckConfig = {
	readonly name: string;
	readonly check: () => Promise<boolean>;
	readonly timeout?: number;
	readonly critical?: boolean;
	readonly interval?: number;
};

export type HealthCheckResult = {
	readonly name: string;
	readonly status: HealthStatus;
	readonly message?: string;
	readonly timestamp: number;
	readonly duration: number;
	readonly critical: boolean;
};

export type AggregatedHealth = {
	readonly status: HealthStatus;
	readonly checks: ReadonlyArray<HealthCheckResult>;
	readonly timestamp: number;
	readonly uptime: number;
};

export type HealthMonitorConfig = {
	readonly checks?: ReadonlyArray<HealthCheckConfig>;
	readonly interval?: number;
	readonly onStatusChange?: (from: HealthStatus, to: HealthStatus) => void;
	readonly onCheckFailed?: (check: HealthCheckResult) => void;
};

export type HealthMonitor = {
	readonly start: () => void;
	readonly stop: () => void;
	readonly getHealth: () => Promise<AggregatedHealth>;
	readonly addCheck: (config: HealthCheckConfig) => void;
	readonly removeCheck: (name: string) => void;
};
