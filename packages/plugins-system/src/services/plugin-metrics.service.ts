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

export const createMetricsCollector = (): MetricsCollector => {
	const metrics = new Map<string, PluginMetrics>();
	const enabledTimestamps = new Map<string, Date>();

	const recordLoad = (pluginId: string, duration: number): void => {
		const current = metrics.get(pluginId);
		const metric: PluginMetrics = {
			callCount: (current?.callCount ?? 0) + 1,
			enabledDuration: current?.enabledDuration ?? 0,
			errorCount: current?.errorCount ?? 0,
			initTime: current?.initTime ?? 0,
			loadTime: duration,
			pluginId,
		};
		if (current?.lastError) {
			(metric as { lastError: Date }).lastError = current.lastError;
		}
		metrics.set(pluginId, metric);
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
		return Object.freeze(
			Array.from(metrics.keys()).map((id) => getMetrics(id)!),
		);
	};

	const getStats = (): PluginPerformanceStats => {
		const allMetrics = getAllMetrics();

		const totalPlugins = allMetrics.length;
		const enabledPlugins = Array.from(enabledTimestamps.keys()).length;
		const errorPlugins = allMetrics.filter((m) => m.errorCount > 0).length;

		const avgLoadTime = allMetrics.reduce((sum, m) => sum + m.loadTime, 0) / totalPlugins || 0;
		const avgInitTime = allMetrics.reduce((sum, m) => sum + m.initTime, 0) / totalPlugins || 0;

		return Object.freeze({
			averageInitTime: avgInitTime,
			averageLoadTime: avgLoadTime,
			enabledPlugins,
			errorPlugins,
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
	const totalPlugins = states.length;

	const totalLoadTime = states.reduce(
		(sum, s) => sum + (s.metrics?.loadTime ?? 0),
		0,
	);
	const totalInitTime = states.reduce(
		(sum, s) => sum + (s.metrics?.initTime ?? 0),
		0,
	);

	return Object.freeze({
		averageInitTime: totalPlugins > 0 ? totalInitTime / totalPlugins : 0,
		averageLoadTime: totalPlugins > 0 ? totalLoadTime / totalPlugins : 0,
		enabledPlugins: states.filter((s) => s.status === "enabled").length,
		errorPlugins: states.filter((s) => s.status === "error").length,
		totalPlugins,
	});
};
