import chokidar from "chokidar";
import type { FSWatcher } from "chokidar";
import { createLogger } from "../utils/logger";

export type WatcherService = {
	start: (paths: string | readonly string[]) => void;
	stop: () => Promise<void>;
	on: (event: 'all', listener: (event: string, path: string) => void) => void;
};

export function createWatcherService(): WatcherService {
	const logger = createLogger("Watcher");
	let watcher: FSWatcher | null = null;

	const start = (paths: string | readonly string[]) => {
		if (watcher) {
			logger.warn("Watcher is already running.");
			return;
		}
		logger.info(`Watching for file changes in: ${Array.isArray(paths) ? paths.join(', ') : paths}`);
		watcher = chokidar.watch(paths, {
			ignored: /(^|[\\/])\../, // ignore dotfiles
			persistent: true,
		});
	};

	const stop = async (): Promise<void> => {
		if (watcher) {
			await watcher.close();
			watcher = null;
			logger.info("Watcher stopped.");
		}
	};

	const on = (event: 'all', listener: (event: string, path: string) => void) => {
		if (watcher) {
			watcher.on(event, listener);
		} else {
			logger.error("Watcher is not started. Cannot attach event listener.");
		}
	};

	return {
		start,
		stop,
		on,
	};
}
