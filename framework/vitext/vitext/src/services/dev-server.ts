import { createDevServer, type DevServerInstance } from "w-devserver";
import type { VitextConfig } from "../types/config";
import { logError, logInfo } from "../utils/logger";

export class DevServer {
	private config: VitextConfig;
	private server: DevServerInstance | null = null;
	private reloadCallbacks: Array<() => void> = [];

	constructor(config: VitextConfig) {
		this.config = config;
	}

	async start(): Promise<void> {
		try {
			logInfo(
				`Starting development server on ${this.config.server.hostname}:${this.config.server.port}`,
			);

			// Create HTTP server using w-devserver
			this.server = createDevServer({
				root: this.config.root,
				port: this.config.server.port,
				hostname: this.config.server.hostname,
				watch: {
					ignored: [
						"**/node_modules/**",
						"**/.git/**",
						"**/dist/**",
						"**/.cache/**",
					],
				},
			});

			// Register for file changes
			this.server.onReload(() => {
				this.triggerReload();
			});

			// Start the server
			await this.server.start();

			logInfo("Development server started!");
			logInfo(
				`Visit http://${this.config.server.hostname}:${this.config.server.port}`,
			);
		} catch (error) {
			logError(
				`Failed to start development server: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			throw error;
		}
	}

	async stop(): Promise<void> {
		logInfo("Stopping development server...");
		if (this.server) {
			await this.server.stop();
		}
		logInfo("Development server stopped!");
	}

	/**
	 * Register reload callback
	 */
	onReload(callback: () => void): void {
		this.reloadCallbacks.push(callback);
	}

	/**
	 * Trigger all reload callbacks
	 */
	private triggerReload(): void {
		logInfo("Triggering hot reload...");
		for (const callback of this.reloadCallbacks) {
			try {
				callback();
			} catch (error) {
				logError(
					`Error in reload callback: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}
	}

	/**
	 * Get file watcher stats
	 */
	getWatcherStats(): any {
		if (this.server) {
			return this.server.getStats();
		}
		return {};
	}
}

