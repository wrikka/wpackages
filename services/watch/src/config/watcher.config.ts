import { DEFAULT_DEBOUNCE_MS, DEFAULT_DEPTH, DEFAULT_IGNORED_PATTERNS } from "../constant";
import type { WatcherConfig } from "../types";

/**
 * Create a watcher configuration with sensible defaults
 * @param paths - Path or array of paths to watch
 * @param override - Configuration overrides
 * @returns Complete watcher configuration
 */
export const createWatcherConfig = (
	paths: string | readonly string[],
	override?: Partial<WatcherConfig>,
): WatcherConfig => {
	const pathArray = Array.isArray(paths) ? paths : [paths];

	return {
		// Core settings
		paths: pathArray,
		ignored: override?.ignored ?? DEFAULT_IGNORED_PATTERNS,
		ignoreInitial: override?.ignoreInitial ?? true,

		// Performance settings
		debounceMs: override?.debounceMs ?? DEFAULT_DEBOUNCE_MS,
		depth: override?.depth ?? DEFAULT_DEPTH,

		// Feature flags
		enableStats: override?.enableStats ?? true,
		enableHotReload: override?.enableHotReload ?? false,

		// File system options
		options: {
			encoding: "utf8" as BufferEncoding,
			persistent: true,
			recursive: true,
			...override?.options,
		},

		// Advanced options
		atomic: override?.atomic ?? true,
		awaitWriteFinish: override?.awaitWriteFinish ?? false,
		followSymlinks: override?.followSymlinks ?? false,
		usePolling: override?.usePolling ?? false,

		// Optional callbacks
		...(override?.pollingInterval !== undefined && {
			pollingInterval: override.pollingInterval,
		}),
		...(override?.handler !== undefined && { handler: override.handler }),
		...(override?.errorHandler !== undefined && {
			errorHandler: override.errorHandler,
		}),
	};
};
