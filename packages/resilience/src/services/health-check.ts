/**
 * Health check service implementation
 */

import { Effect } from "effect";
import type {
	AggregatedHealth,
	HealthCheckConfig,
	HealthCheckResult,
	HealthMonitor,
	HealthMonitorConfig,
	HealthStatus,
} from "../types";

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_INTERVAL = 30000;

// Run individual health check
export const runHealthCheck = async (
	config: HealthCheckConfig,
): Promise<HealthCheckResult> => {
	const startTime = Date.now();
	const timeout = config.timeout || DEFAULT_TIMEOUT;

	try {
		const timeoutPromise = new Promise<boolean>((_, reject) => {
			setTimeout(() => reject(new Error("Health check timeout")), timeout);
		});

		const result = await Promise.race([config.check(), timeoutPromise]);

		const duration = Date.now() - startTime;

		return {
			critical: config.critical || false,
			duration,
			message: result ? "Check passed" : "Check failed",
			name: config.name,
			status: result ? "healthy" : "unhealthy",
			timestamp: Date.now(),
		};
	} catch (err) {
		const duration = Date.now() - startTime;
		const error = err as Error;

		return {
			critical: config.critical || false,
			duration,
			message: error.message,
			name: config.name,
			status: "unhealthy",
			timestamp: Date.now(),
		};
	}
};

// Aggregate health check results
export const aggregateHealth = (
	checks: ReadonlyArray<HealthCheckResult>,
	startTime: number,
): AggregatedHealth => {
	const hasCriticalFailure = checks.some(
		(check) => check.critical && check.status === "unhealthy",
	);

	const hasAnyFailure = checks.some((check) => check.status === "unhealthy");

	const hasAnyDegraded = checks.some((check) => check.status === "degraded");

	let status: HealthStatus;
	if (hasCriticalFailure) {
		status = "unhealthy";
	} else if (hasAnyFailure || hasAnyDegraded) {
		status = "degraded";
	} else {
		status = "healthy";
	}

	return {
		checks,
		status,
		timestamp: Date.now(),
		uptime: Date.now() - startTime,
	};
};

// Create health monitor
export const createHealthMonitor = (
	config: HealthMonitorConfig,
): HealthMonitor => {
	const checks = new Map<string, HealthCheckConfig>();
	const results = new Map<string, HealthCheckResult>();
	const startTime = Date.now();
	const interval = config.interval || DEFAULT_INTERVAL;

	let intervalId: NodeJS.Timeout | undefined;
	let currentStatus: HealthStatus = "healthy";

	for (const check of config.checks || []) {
		checks.set(check.name, check);
	}

	const runChecks = async (): Promise<void> => {
		const checkPromises = Array.from(checks.values()).map((check) => runHealthCheck(check));

		const checkResults = await Promise.all(checkPromises);

		for (const result of checkResults) {
			results.set(result.name, result);

			if (result.status === "unhealthy") {
				config.onCheckFailed?.(result);
			}
		}

		const aggregated = aggregateHealth(checkResults, startTime);

		if (aggregated.status !== currentStatus) {
			const oldStatus = currentStatus;
			currentStatus = aggregated.status;
			config.onStatusChange?.(oldStatus, currentStatus);
		}
	};

	const start = (): void => {
		if (intervalId) {
			return;
		}

		runChecks();

		intervalId = setInterval(() => {
			runChecks();
		}, interval);
	};

	const stop = (): void => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = undefined;
		}
	};

	const getHealth = async (): Promise<AggregatedHealth> => {
		await runChecks();
		const checkResults = Array.from(results.values());
		return aggregateHealth(checkResults, startTime);
	};

	const addCheck = (checkConfig: HealthCheckConfig): void => {
		checks.set(checkConfig.name, checkConfig);
	};

	const removeCheck = (name: string): void => {
		checks.delete(name);
		results.delete(name);
	};

	return {
		addCheck,
		getHealth,
		removeCheck,
		start,
		stop,
	};
};

// Health check factories
export const createDatabaseHealthCheck = (
	name: string,
	checkFn: () => Promise<boolean>,
): HealthCheckConfig => ({
	check: checkFn,
	critical: true,
	name,
	timeout: 5000,
});

export const createAPIHealthCheck = (
	name: string,
	url: string,
): HealthCheckConfig => ({
	check: async () => {
		try {
			const response = await fetch(url, { method: "GET" });
			return response.ok;
		} catch {
			return false;
		}
	},
	critical: false,
	name,
	timeout: 10000,
});

export const createMemoryHealthCheck = (
	name: string,
	thresholdPercent = 90,
): HealthCheckConfig => ({
	check: async () => {
		const usage = process.memoryUsage();
		const usedPercent = (usage.heapUsed / usage.heapTotal) * 100;
		return usedPercent < thresholdPercent;
	},
	critical: false,
	name,
	timeout: 1000,
});

export const createCustomHealthCheck = (
	name: string,
	checkFn: () => Promise<boolean>,
	options: Partial<Omit<HealthCheckConfig, "name" | "check">> = {},
): HealthCheckConfig => ({
	check: checkFn,
	critical: options.critical || false,
	name,
	timeout: options.timeout || 5000,
	...(options.interval !== undefined && { interval: options.interval }),
});

// Effect-based health check
export const healthCheckEffect = (
	config: HealthCheckConfig,
): Effect.Effect<HealthCheckResult, Error> =>
	Effect.tryPromise({
		try: () => runHealthCheck(config),
		catch: (error) => new Error(`Health check failed: ${error}`),
	});

// Default health monitor configuration
export const defaultHealthMonitorConfig: HealthMonitorConfig = {
	checks: [],
	interval: DEFAULT_INTERVAL,
};
