export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface HealthCheckConfig {
	readonly intervalMs: number;
	readonly timeoutMs: number;
	readonly maxRetries: number;
	readonly retryDelayMs: number;
}

export interface HealthCheckResult {
	readonly pluginId: string;
	readonly status: HealthStatus;
	readonly timestamp: Date;
	readonly responseTime?: number;
	readonly message?: string;
	readonly error?: Error;
	readonly retryCount?: number;
}

export interface HealthCheckOptions {
	readonly timeout?: number;
	readonly retries?: number;
}

export interface HealthCheckManager {
	readonly start: () => Promise<void>;
	readonly stop: () => Promise<void>;
	readonly check: (pluginId: string, options?: HealthCheckOptions) => Promise<HealthCheckResult>;
	readonly checkAll: () => Promise<readonly HealthCheckResult[]>;
	readonly getStatus: (pluginId: string) => HealthStatus;
	readonly getAllStatuses: () => Readonly<Record<string, HealthStatus>>;
	readonly onHealthChange: (
		callback: (result: HealthCheckResult) => void,
	) => () => void;
}
