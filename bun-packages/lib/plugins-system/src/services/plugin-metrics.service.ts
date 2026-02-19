import type { PluginHealthCheck, PluginMetrics, PluginPerformanceStats, PluginRegistry } from "../types";

export interface MetricsCollector {
	readonly recordLoad: (pluginId: string, duration: number) => void;
	readonly recordInit: (pluginId: string, duration: number) => void;
	readonly recordError: (pluginId: string) => void;
	readonly getMetrics: (pluginId: string) => PluginMetrics | undefined;
	readonly getAllMetrics: () => readonly PluginMetrics[];
	readonly getStats: () => PluginPerformanceStats;
	readonly checkHealth: (pluginId: string) => PluginHealthCheck;
	readonly clear: () => void;
}

const calculateAverage = <T>(items: readonly T[], accessor: (item: T) => number): number => {
	const total = items.reduce((sum, item) => sum + accessor(item), 0);
	return items.length > 0 ? total / items.length : 0;
};

export const createMetricsCollector = (): MetricsCollector => {
	const metrics = new Map<string, PluginMetrics>();
	const enabledTimestamps = new Map<string, Date>();

	const recordLoad = (pluginId: string, duration: number): void => {
		const current = metrics.get(pluginId);
		metrics.set(pluginId, {
			...current,
			pluginId,
			loadTime: duration,
			initTime: current?.initTime ?? 0,
			enabledDuration: current?.enabledDuration ?? 0,
			errorCount: current?.errorCount ?? 0,
			callCount: (current?.callCount ?? 0) + 1,
		});
	};

	const recordInit = (pluginId: string, duration: number): void => {
		const current = metrics.get(pluginId);
		if (current) {
			metrics.set(pluginId, {
				...current,
				initTime: duration,
			});
		}
		enabledTimestamps.set(pluginId, new Date());
	};

	const recordError = (pluginId: string): void => {
		const current = metrics.get(pluginId);
		if (current) {
			metrics.set(pluginId, {
				...current,
				errorCount: current.errorCount + 1,
				lastError: new Date(),
			});
		}
	};

	const getMetrics = (pluginId: string): PluginMetrics | undefined => {
		const metric = metrics.get(pluginId);
		if (!metric) return undefined;

		const enabledAt = enabledTimestamps.get(pluginId);
		const enabledDuration = enabledAt
			? Date.now() - enabledAt.getTime()
			: metric.enabledDuration;

		return {
			...metric,
			enabledDuration,
		};
	};

	const getAllMetrics = (): readonly PluginMetrics[] => {
		const allMetrics = Array.from(metrics.keys())
			.map(getMetrics)
			.filter((metric): metric is PluginMetrics => metric !== undefined);
		return Object.freeze(allMetrics);
	};

	const getStats = (): PluginPerformanceStats => {
		const allMetrics = getAllMetrics();
		const totalPlugins = allMetrics.length;

		return Object.freeze({
			averageInitTime: calculateAverage(allMetrics, (m) => m.initTime),
			averageLoadTime: calculateAverage(allMetrics, (m) => m.loadTime),
			enabledPlugins: Array.from(enabledTimestamps.keys()).length,
			errorPlugins: allMetrics.filter((m) => m.errorCount > 0).length,
			totalPlugins,
		});
	};

	const checkHealth = (pluginId: string): PluginHealthCheck => {
		const metric = getMetrics(pluginId);

		if (!metric) {
			return Object.freeze({
				healthy: false,
				lastCheck: new Date(),
				message: "Plugin not found",
				pluginId,
			});
		}

		const hasRecentErrors = metric.lastError && Date.now() - metric.lastError.getTime() < 60000; // 1 minute

		const healthy = !hasRecentErrors && metric.errorCount < 5;

		return Object.freeze({
			healthy,
			lastCheck: new Date(),
			message: healthy
				? "Plugin is healthy"
				: `Plugin has ${metric.errorCount} errors`,
			pluginId,
		});
	};

	const clear = (): void => {
		metrics.clear();
		enabledTimestamps.clear();
	};

	return Object.freeze({
		checkHealth,
		clear,
		getAllMetrics,
		getMetrics,
		getStats,
		recordError,
		recordInit,
		recordLoad,
	});
};

export const analyzeRegistry = (
	registry: PluginRegistry,
): PluginPerformanceStats => {
	const states = Object.values(registry);

	return Object.freeze({
		averageInitTime: calculateAverage(
			states,
			(s) => s.metrics?.initTime ?? 0,
		),
		averageLoadTime: calculateAverage(
			states,
			(s) => s.metrics?.loadTime ?? 0,
		),
		enabledPlugins: states.filter((s) => s.status === "enabled").length,
		errorPlugins: states.filter((s) => s.status === "error").length,
		totalPlugins: states.length,
	});
};
