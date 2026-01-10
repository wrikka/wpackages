export interface TelemetryEvent {
	readonly pluginId: string;
	readonly eventType: string;
	readonly timestamp: Date;
	readonly data?: Record<string, unknown>;
}

export interface TelemetryConfig {
	readonly enabled: boolean;
	readonly anonymous: boolean;
	readonly batchSize: number;
	readonly flushIntervalMs: number;
	readonly endpoint?: string;
}

export interface UsageStats {
	readonly pluginId: string;
	readonly installCount: number;
	readonly enableCount: number;
	readonly disableCount: number;
	readonly errorCount: number;
	readonly totalRuntime: number;
	readonly lastUsedAt: Date;
}

export interface FeatureUsage {
	readonly pluginId: string;
	readonly feature: string;
	readonly usageCount: number;
	readonly lastUsedAt: Date;
}

export interface TelemetryManager {
	readonly track: (event: TelemetryEvent) => Promise<void>;
	readonly trackError: (pluginId: string, error: Error) => Promise<void>;
	readonly trackFeatureUsage: (pluginId: string, feature: string) => Promise<void>;
	readonly getUsageStats: (pluginId: string) => Promise<UsageStats>;
	readonly getFeatureUsage: (pluginId: string) => Promise<readonly FeatureUsage[]>;
	readonly flush: () => Promise<void>;
	readonly reset: (pluginId?: string) => Promise<void>;
}
