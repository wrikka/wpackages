import { createServer as createHttpServer, type Server } from "node:http";
import { toNodeListener } from "h3";
import { createDevServerConfig } from "../config";
import type { DevServerConfig, DevServerInstance, ServerStats } from "../types";
import { createLogger } from "../utils/logger";
import { createServer as createApp } from "../server";
import { createPerformanceMonitor } from "./performance-monitor.service";
import { createWatcherService } from "./watcher.service";

export const createDevServer = (
	config: Partial<DevServerConfig> = {},
): DevServerInstance => {
	const finalConfig = createDevServerConfig(config);
	const logger = createLogger("DevServer");
	const performanceMonitor = createPerformanceMonitor(logger);
	const watcher = createWatcherService();

	let server: Server | null = null;

	const start = async (): Promise<void> => {
		logger.info(
			`Starting development server on ${finalConfig.hostname}:${finalConfig.port}`,
		);

		try {
			performanceMonitor.start();
			const app = createApp();
			server = createHttpServer(toNodeListener(app));
			server.listen(finalConfig.port, finalConfig.hostname);
			if (finalConfig.root) {
				watcher.start(finalConfig.root);
			}
			logger.info("Development server started successfully!");
		} catch (error) {
			logger.error(
				`Failed to start development server: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
			throw error;
		}
	};

	
	const stop = async (): Promise<void> => {
		logger.info("Stopping development server...");

		try {
						await watcher.stop();
			if (server) {
				server.close();
				server = null;
			}
			performanceMonitor.stop();
			logger.info("Development server stopped successfully!");
		} catch (error) {
			logger.error(
				`Failed to stop development server: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
			throw error;
		}
	};

	const onReload = (callback: () => void | Promise<void>): void => {
		watcher.on('all', (event, path) => {
			logger.info(`File ${event}: ${path}. Triggering reload...`);
			Promise.resolve(callback()).catch(err => logger.error(`Reload callback failed: ${err}`));
		});
	};

	const getStats = (): ServerStats => {
		return {
			performance: performanceMonitor.getStats(),
			vite: null,
			server: server ? { status: "running" } : { status: "stopped" },
			watcher: { active: !!server },
			cache: null, // Not implemented yet
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
