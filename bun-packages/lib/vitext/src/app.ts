import { createApp } from "h3";
import { createConfig, defaultConfig } from "./config/vitext";
import { createBuildConfig } from "./services/builder";
import { cacheService } from "./services/caching";
import { DevServer } from "./services/dev-server";
import { unwrapOrLog } from "./services/error-handler";
import { fileWatcher } from "./services/file-watcher";
import { createServer } from "./services/server";
import type { VitextConfig } from "./types/config";
import type { BuildConfig } from "./types/config";

export interface VitextAppInstance {
	config: VitextConfig;
	server: ReturnType<typeof createServer>;
	start(): Promise<void>;
	build(buildConfig?: Partial<BuildConfig>): Promise<void>;
	webApp: ReturnType<typeof createApp>;
	cache: typeof cacheService;
	watcher: typeof fileWatcher;
}

export const createVitextApp = async (config?: Partial<VitextConfig>): Promise<VitextAppInstance> => {
	// Handle config creation with error handling
	const configResult = await createConfig(config);
	const appConfig = unwrapOrLog(configResult, defaultConfig);

	const server = createServer(appConfig);
	const devServer = new DevServer(appConfig);
	const webApp = createApp();

	return {
		config: appConfig,
		server,
		async start() {
			// Start the development server
			await devServer.start();
		},
		async build(buildConfig?: Partial<BuildConfig>) {
			// Build the project
			createBuildConfig(buildConfig);
			console.log("Building Vitext project...");
			// In a real implementation, this would trigger the build process
		},
		// Expose web-server app for advanced usage
		webApp,
		// Expose cache service for advanced usage
		cache: cacheService,
		// Expose file watcher for advanced usage
		watcher: fileWatcher,
	};
};
