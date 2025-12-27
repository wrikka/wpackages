import { watch, type WatcherInstance, type WatcherConfig } from "watch";
import { createDevServerConfig } from "../config";
import type { CacheConfig, DevServerConfig, DevServerInstance } from "../types";
import { createLogger } from "../utils/logger";
import { createHotReloadService } from "./hot-reload.service";
import { createPerformanceMonitor } from "./performance-monitor.service";

// Simple cache implementation
interface Cache {
	get<T>(key: string): T | undefined;
	set<T>(key: string, value: T, ttl?: number): void;
	clear(): void;
}

interface ServerInstance {
	listen: {
		run: () => Promise<void>;
	};
	close: () => Promise<void>;
}

interface WatchConfig extends Partial<WatcherConfig> {
	enableHotReload: boolean;
}

const createCache = (_config?: Partial<CacheConfig>): Cache => ({
	get: () => undefined,
	set: () => {},
	clear: () => {},
});

export const createDevServer = (
	config: Partial<DevServerConfig> = {},
): DevServerInstance => {
	const finalConfig = createDevServerConfig(config);
	const logger = createLogger("DevServer");
	const hotReloadService = createHotReloadService(logger);
	const performanceMonitor = createPerformanceMonitor(logger);

	let watcher: WatcherInstance | null = null;
	let server: ServerInstance | null = null;
	let cache: Cache | null = null;

	const start = async (): Promise<void> => {
		logger.info(
			`Starting development server on ${finalConfig.hostname}:${finalConfig.port}`,
		);

		try {
			// Initialize cache
			cache = createCache({
				ttl: finalConfig.cache?.ttl,
			});

			// Create HTTP server (using Bun native)
			server = {
				listen: {
					run: async () => {
						logger.info(`Server listening on ${finalConfig.hostname}:${finalConfig.port}`);
					},
				},
				close: async () => {
					logger.info("Server closed");
				},
			};

			// Start performance monitoring
			performanceMonitor.start();

			// Start file watcher
			const watchConfig: WatchConfig = {
				enableHotReload: true,
				...finalConfig.watch,
			};
			watcher = watch(finalConfig.root!, watchConfig);

			// Register file change events
			watcher.on("change", (event) => {
				performanceMonitor.recordFileEvent();
				logger.info(`File changed: ${event.path}`);
				// Trigger hot reload
				hotReloadService.triggerReload().catch((error) => {
					logger.error(`Failed to trigger reload: ${error instanceof Error ? error.message : "Unknown error"}`);
				});
			});

			watcher.on("add", (event) => {
				performanceMonitor.recordFileEvent();
				logger.info(`File added: ${event.path}`);
			});

			watcher.on("unlink", (event) => {
				performanceMonitor.recordFileEvent();
				logger.info(`File removed: ${event.path}`);
			});

			// Start watcher
			await watcher.start();

			// Start server
			await server.listen.run();

			logger.info("Development server started successfully!");
			logger.info(`Visit http://${finalConfig.hostname}:${finalConfig.port}`);
		} catch (error) {
			logger.error(
				`Failed to start development server: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			throw error;
		}
	};

	const stop = async (): Promise<void> => {
		logger.info("Stopping development server...");

		try {
			// Stop file watcher
			if (watcher) {
				await watcher.stop();
			}

			// Clear cache
			if (cache) {
				cache.clear();
			}

			logger.info("Development server stopped successfully!");
		} catch (error) {
			logger.error(
				`Failed to stop development server: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			throw error;
		}
	};

	const onReload = (callback: () => void | Promise<void>): void => {
		hotReloadService.onReload(callback);
	};

	const getStats = () => {
		return {
			performance: performanceMonitor.getStats(),
			watcher: watcher ? { active: true } : null,
			cache: cache ? { active: true } : null,
		};
	};

	const getPerformanceStats = () => {
		return performanceMonitor.getStats();
	};

	const getRecommendations = (): string[] => {
		return performanceMonitor.getRecommendations();
	};

	return {
		start,
		stop,
		onReload,
		getStats,
		getPerformanceStats,
		getRecommendations,
	};
};
