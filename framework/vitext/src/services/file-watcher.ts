import { watch } from "@wpackages/watch";
import type { WatchEvent, WatcherInstance } from "@wpackages/watch";
import { logError, logInfo } from "../utils/logger";

/**
 * Vitext File Watcher Service
 *
 * Provides file watching capabilities for hot module replacement and development server reloading.
 */

export class VitextFileWatcher {
	private watcher: WatcherInstance | null = null;
	private callbacks: Array<(path: string, event: string) => void> = [];
	private isWatching: boolean = false;

	constructor() {}

	/**
	 * Start watching files
	 */
	async start(paths: string | string[], options: any = {}): Promise<void> {
		if (this.isWatching) {
			logInfo("File watcher is already running");
			return;
		}

		try {
			this.watcher = watch(paths, {
				ignored: options.ignored || ["**/node_modules/**", "**/.git/**", "**/dist/**"],
				ignoreInitial: options.ignoreInitial ?? true,
				debounceMs: options.debounceMs ?? 100,
				depth: options.depth ?? 10,
				enableHotReload: options.enableHotReload ?? true,
				...options,
			});

			// Register event handlers
			this.watcher.on("add", (event: WatchEvent) => {
				logInfo(`File added: ${event.path}`);
				this.triggerCallbacks(event.path, "add");
			});

			this.watcher.on("change", (event: WatchEvent) => {
				logInfo(`File changed: ${event.path}`);
				this.triggerCallbacks(event.path, "change");
			});

			this.watcher.on("unlink", (event: WatchEvent) => {
				logInfo(`File removed: ${event.path}`);
				this.triggerCallbacks(event.path, "unlink");
			});

			this.watcher.on("addDir", (event: WatchEvent) => {
				logInfo(`Directory added: ${event.path}`);
				this.triggerCallbacks(event.path, "addDir");
			});

			this.watcher.on("unlinkDir", (event: WatchEvent) => {
				logInfo(`Directory removed: ${event.path}`);
				this.triggerCallbacks(event.path, "unlinkDir");
			});

			this.watcher.on("error", (_error: any) => {
				logError(
					`File watcher error: ${_error instanceof Error ? _error.message : "Unknown error"}`,
				);
			});

			await this.watcher.start();
			this.isWatching = true;
			logInfo("File watcher started successfully");
		} catch (error) {
			logError(`Failed to start file watcher: ${error instanceof Error ? error.message : "Unknown error"}`);
			throw error;
		}
	}

	/**
	 * Stop watching files
	 */
	async stop(): Promise<void> {
		if (!this.isWatching || !this.watcher) {
			logInfo("File watcher is not running");
			return;
		}

		try {
			await this.watcher.stop();
			this.watcher = null;
			this.isWatching = false;
			logInfo("File watcher stopped successfully");
		} catch (error) {
			logError(`Failed to stop file watcher: ${error instanceof Error ? error.message : "Unknown error"}`);
			throw error;
		}
	}

	/**
	 * Register callback for file changes
	 */
	onChange(callback: (path: string, event: string) => void): void {
		this.callbacks.push(callback);
	}

	/**
	 * Remove callback
	 */
	removeCallback(callback: (path: string, event: string) => void): void {
		const index = this.callbacks.indexOf(callback);
		if (index !== -1) {
			this.callbacks.splice(index, 1);
		}
	}

	/**
	 * Trigger all registered callbacks
	 */
	private triggerCallbacks(path: string, event: string): void {
		for (const callback of this.callbacks) {
			try {
				callback(path, event);
			} catch (error) {
				logError(`Error in file watcher callback: ${error instanceof Error ? error.message : "Unknown error"}`);
			}
		}
	}

	/**
	 * Get watcher statistics
	 */
	getStats(): any {
		if (!this.watcher) {
			return { isWatching: false };
		}

		return {
			isWatching: this.isWatching,
			stats: this.watcher.getStats(),
			performance: this.watcher.getPerformanceStats?.() || null,
			recommendations: this.watcher.getPerformanceRecommendations?.() || null,
		};
	}

	/**
	 * Check if watcher is active
	 */
	isActive(): boolean {
		return this.isWatching;
	}
}

// Global file watcher instance
export const fileWatcher = new VitextFileWatcher();
