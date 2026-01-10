import type { PluginMetrics } from "../types/metrics.types";

export const createPerformanceMonitor = (): {
	readonly startMeasure: (pluginId: string, operation: string) => void;
	readonly endMeasure: (pluginId: string, operation: string): number;
	readonly getStats: (pluginId: string) => PluginMetrics;
	readonly reset: (pluginId?: string) => void;
} => {
	const metrics: Map<string, PluginMetrics> = new Map();
	const activeMeasures: Map<string, number> = new Map();

	const getOrCreateMetrics = (pluginId: string): PluginMetrics => {
		if (!metrics.has(pluginId)) {
			metrics.set(pluginId, {
				pluginId,
				loadTime: 0,
				initTime: 0,
				errorCount: 0,
				enabledDuration: 0,
				callCount: 0,
			});
		}
		return metrics.get(pluginId)!;
	};

	const startMeasure = (pluginId: string, operation: string): void => {
		const key = `${pluginId}:${operation}`;
		activeMeasures.set(key, performance.now());
	};

	const endMeasure = (pluginId: string, operation: string): number => {
		const key = `${pluginId}:${operation}`;
		const startTime = activeMeasures.get(key);
		if (startTime === undefined) {
			return 0;
		}

		const duration = performance.now() - startTime;
		activeMeasures.delete(key);

		const pluginMetrics = getOrCreateMetrics(pluginId);

		if (operation === "load") {
			metrics.set(pluginId, {
				...pluginMetrics,
				loadTime: duration,
			});
		} else if (operation === "init") {
			metrics.set(pluginId, {
				...pluginMetrics,
				initTime: duration,
			});
		}

		const updatedMetrics = metrics.get(pluginId)!;
		metrics.set(pluginId, {
			...updatedMetrics,
			callCount: updatedMetrics.callCount + 1,
		});

		return duration;
	};

	const getStats = (pluginId: string): PluginMetrics => {
		const metricsData = metrics.get(pluginId);
		if (!metricsData) {
			return {
				pluginId,
				loadTime: 0,
				initTime: 0,
				errorCount: 0,
				enabledDuration: 0,
				callCount: 0,
			};
		}

		return {
			...metricsData,
			memoryUsage: process.memoryUsage().heapUsed,
		};
	};

	const reset = (pluginId?: string): void => {
		if (pluginId) {
			metrics.delete(pluginId);
		} else {
			metrics.clear();
		}
	};

	return Object.freeze({
		startMeasure,
		endMeasure,
		getStats,
		reset,
	});
};
