import type {
	HealthCheckConfig,
	HealthCheckManager,
	HealthCheckOptions,
	HealthCheckResult,
	HealthStatus,
} from "../types/health-check.types";
import type { PluginManager } from "./plugin-manager.service";

export const createHealthCheckManager = (
	pluginManager: PluginManager,
	config: HealthCheckConfig = {
		intervalMs: 60000,
		timeoutMs: 5000,
		maxRetries: 3,
		retryDelayMs: 1000,
	},
): HealthCheckManager => {
	let intervalId: ReturnType<typeof setInterval> | null = null;
	const statuses: Map<string, HealthStatus> = new Map();
	const listeners: Array<(result: HealthCheckResult) => void> = [];

	const check = async (
		pluginId: string,
		options: HealthCheckOptions = {},
	): Promise<HealthCheckResult> => {
		const startTime = Date.now();
		const _timeout = options.timeout ?? config.timeoutMs;
		const maxRetries = options.retries ?? config.maxRetries;

		let retryCount = 0;
		let lastError: Error | undefined;

		while (retryCount <= maxRetries) {
			try {
				const pluginState = pluginManager.get(pluginId);

				if (!pluginState) {
					return {
						pluginId,
						status: "unhealthy",
						timestamp: new Date(),
						responseTime: Date.now() - startTime,
						message: "Plugin not found",
					};
				}

				if (pluginState.status === "error") {
					return {
						pluginId,
						status: "unhealthy",
						timestamp: new Date(),
						responseTime: Date.now() - startTime,
						message: "Plugin in error state",
						error: pluginState.error,
					};
				}

				if (pluginState.status === "enabled") {
					statuses.set(pluginId, "healthy");
					return {
						pluginId,
						status: "healthy",
						timestamp: new Date(),
						responseTime: Date.now() - startTime,
					};
				}

				statuses.set(pluginId, "degraded");
				return {
					pluginId,
					status: "degraded",
					timestamp: new Date(),
					responseTime: Date.now() - startTime,
					message: `Plugin status: ${pluginState.status}`,
				};
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				retryCount++;

				if (retryCount <= maxRetries) {
					await new Promise((resolve) => setTimeout(resolve, config.retryDelayMs));
				}
			}
		}

		statuses.set(pluginId, "unhealthy");
		return {
			pluginId,
			status: "unhealthy",
			timestamp: new Date(),
			responseTime: Date.now() - startTime,
			error: lastError,
			retryCount,
		};
	};

	const checkAll = async (): Promise<readonly HealthCheckResult[]> => {
		const plugins = pluginManager.getAll();
		const results = await Promise.all(
			plugins.map((p) => check(p.plugin.metadata.id)),
		);
		return Object.freeze(results);
	};

	const getStatus = (pluginId: string): HealthStatus => {
		return statuses.get(pluginId) ?? "unknown";
	};

	const getAllStatuses = (): Readonly<Record<string, HealthStatus>> => {
		return Object.freeze(Object.fromEntries(statuses));
	};

	const onHealthChange = (callback: (result: HealthCheckResult) => void): (() => void) => {
		listeners.push(callback);
		return () => {
			const index = listeners.indexOf(callback);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		};
	};

	const start = async (): Promise<void> => {
		if (intervalId) return;

		intervalId = setInterval(async () => {
			const results = await checkAll();
			results.forEach((result) => {
				const oldStatus = statuses.get(result.pluginId);
				if (oldStatus !== result.status) {
					listeners.forEach((listener) => listener(result));
				}
			});
		}, config.intervalMs);
	};

	const stop = async (): Promise<void> => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	};

	return Object.freeze({
		start,
		stop,
		check,
		checkAll,
		getStatus,
		getAllStatuses,
		onHealthChange,
	});
};
