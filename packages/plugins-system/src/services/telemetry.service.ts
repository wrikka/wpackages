import type {
	FeatureUsage,
	TelemetryConfig,
	TelemetryEvent,
	TelemetryManager,
	UsageStats,
} from "../types/telemetry.types";

export const createTelemetryManager = (
	config: TelemetryConfig = {
		enabled: true,
		anonymous: true,
		batchSize: 10,
		flushIntervalMs: 30000,
	},
): TelemetryManager => {
	const events: TelemetryEvent[] = [];
	const usageStats: Map<string, UsageStats> = new Map();
	const featureUsage: Map<string, FeatureUsage[]> = new Map();
	let flushTimer: ReturnType<typeof setInterval> | null = null;

	const track = async (event: TelemetryEvent): Promise<void> => {
		if (!config.enabled) return;

		events.push(event);

		if (events.length >= config.batchSize) {
			await flush();
		}
	};

	const trackError = async (pluginId: string, error: Error): Promise<void> => {
		const stats = usageStats.get(pluginId) ?? {
			pluginId,
			installCount: 0,
			enableCount: 0,
			disableCount: 0,
			errorCount: 0,
			totalRuntime: 0,
			lastUsedAt: new Date(),
		};

		stats.errorCount++;
		stats.lastUsedAt = new Date();
		usageStats.set(pluginId, stats);

		await track({
			pluginId,
			eventType: "error",
			timestamp: new Date(),
			data: {
				message: error.message,
				stack: error.stack,
			},
		});
	};

	const trackFeatureUsage = async (pluginId: string, feature: string): Promise<void> => {
		const features = featureUsage.get(pluginId) ?? [];
		const existing = features.find((f) => f.feature === feature);

		if (existing) {
			existing.usageCount++;
			existing.lastUsedAt = new Date();
		} else {
			features.push({
				pluginId,
				feature,
				usageCount: 1,
				lastUsedAt: new Date(),
			});
		}

		featureUsage.set(pluginId, features);
	};

	const getUsageStats = async (pluginId: string): Promise<UsageStats> => {
		return (
			usageStats.get(pluginId) ?? {
				pluginId,
				installCount: 0,
				enableCount: 0,
				disableCount: 0,
				errorCount: 0,
				totalRuntime: 0,
				lastUsedAt: new Date(),
			}
		);
	};

	const getFeatureUsage = async (pluginId: string): Promise<readonly FeatureUsage[]> => {
		return Object.freeze(featureUsage.get(pluginId) ?? []);
	};

	const flush = async (): Promise<void> => {
		if (events.length === 0) return;

		if (config.endpoint) {
			try {
				await fetch(config.endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						events: config.anonymous
							? events.map((e) => ({
									...e,
									pluginId: hashPluginId(e.pluginId),
								}))
							: events,
					}),
				});
			} catch {
			}
		}

		events.length = 0;
	};

	const reset = async (pluginId?: string): Promise<void> => {
		if (pluginId) {
			usageStats.delete(pluginId);
			featureUsage.delete(pluginId);
		} else {
			usageStats.clear();
			featureUsage.clear();
		}
	};

	const hashPluginId = (id: string): string => {
		let hash = 0;
		for (let i = 0; i < id.length; i++) {
			const char = id.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return `plugin_${Math.abs(hash)}`;
	};

	if (config.flushIntervalMs > 0) {
		flushTimer = setInterval(flush, config.flushIntervalMs);
	}

	return Object.freeze({
		track,
		trackError,
		trackFeatureUsage,
		getUsageStats,
		getFeatureUsage,
		flush,
		reset,
	});
};
