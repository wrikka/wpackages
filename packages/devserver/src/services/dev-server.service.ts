import { toNodeListener } from "h3";
import { createServer as createHttpServer, type Server } from "node:http";
import { join } from "node:path";
import { handleWebSocket } from "../components/devtools-ws";
import { createDevServerConfig } from "../config";
import { createServer as createApp } from "../server";
import type { DevServerConfig, DevServerInstance, DevServerWs, ServerStats } from "../types";
import { createLogger } from "../utils/logger";
import { createMetadataCache, createTransformCache } from "./cache.service";
import { createModuleGraph } from "./module-graph.service";
import { createPerformanceMonitor } from "./performance-monitor.service";
import { createResolver } from "./resolver.service";
import { createWatcherService } from "./watcher.service";
import { createWebSocketServer } from "./websocket.service";

export const createDevServer = (
	config: Partial<DevServerConfig> = {},
): DevServerInstance => {
	const finalConfig = createDevServerConfig(config);
	const logger = createLogger("DevServer");
	const performanceMonitor = createPerformanceMonitor(logger);
	const watcher = createWatcherService();

	// Initialize cache, module graph, and resolver
	const cacheDir = join(finalConfig.root || process.cwd(), ".wdev", "cache");
	const transformCache = createTransformCache(cacheDir);
	const _metadataCache = createMetadataCache(cacheDir);
	const moduleGraph = createModuleGraph(transformCache);
	const _resolver = createResolver({
		root: finalConfig.root || process.cwd(),
		alias: finalConfig.alias || {},
		extensions: finalConfig.extensions || [".ts", ".tsx", ".js", ".jsx", ".json", ".css"],
	});

	let server: Server | null = null;
	let wsServer: DevServerWs | null = null;

	const start = async (): Promise<void> => {
		logger.info(
			`Starting development server on ${finalConfig.hostname}:${finalConfig.port}`,
		);

		try {
			performanceMonitor.start();
			const app = createApp();
			server = createHttpServer(toNodeListener(app));
			wsServer = createWebSocketServer(server);

			// Setup WebSocket handlers
			handleWebSocket({
				root: finalConfig.root || process.cwd(),
				port: finalConfig.port || 3000,
				hostname: finalConfig.hostname || "localhost",
				ws: wsServer,
			});

			server.listen(finalConfig.port || 3000, finalConfig.hostname || "localhost");
			if (finalConfig.root) {
				watcher.start(finalConfig.root);
			}
			logger.info("Development server started successfully!");
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
			await watcher.stop();
			if (server) {
				server.close();
				server = null;
			}
			performanceMonitor.stop();
			logger.info("Development server stopped successfully!");
		} catch (error) {
			logger.error(
				`Failed to stop development server: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			throw error;
		}
	};

	const onReload = (callback: () => void | Promise<void>): void => {
		watcher.on("all", (event, path) => {
			logger.info(`File ${event}: ${path}. Triggering reload...`);

			// Send HMR update to all connected clients
			if (wsServer) {
				wsServer.broadcast({
					type: "wdev:hmr-update",
					data: {
						type: "full-reload",
						timestamp: Date.now(),
					},
				});
			}

			Promise.resolve(callback()).catch(err => logger.error(`Reload callback failed: ${err}`));
		});
	};

	const getStats = (): ServerStats => {
		// const graphStats = moduleGraph.getStats(); // TODO: expose in stats
		return {
			performance: performanceMonitor.getStats(),
			hmr: { active: !!wsServer, connectedClients: 0 }, // TODO: track connected clients
			server: server ? { status: "running" } : { status: "stopped" },
			watcher: { active: !!server },
			cache: { active: true }, // Cache is always active now
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
