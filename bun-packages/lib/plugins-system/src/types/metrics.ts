export interface PluginMetrics {
	readonly pluginId: string;
	readonly loadTime: number;
	readonly initTime: number;
	readonly memoryUsage?: number;
	readonly errorCount: number;
	readonly lastError?: Date;
	readonly enabledDuration: number;
	readonly callCount: number;
}

export interface PluginHealthCheck {
	readonly pluginId: string;
	readonly healthy: boolean;
	readonly lastCheck: Date;
	readonly message?: string;
}

export interface PluginPerformanceStats {
	readonly averageLoadTime: number;
	readonly averageInitTime: number;
	readonly totalPlugins: number;
	readonly enabledPlugins: number;
	readonly errorPlugins: number;
}
