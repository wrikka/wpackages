import { createWatcherConfig } from "./config";
import { createFileWatcher } from "./services";
import type { WatcherConfig, WatcherInstance } from "./types";

export const watch = (
	paths: string | readonly string[],
	override?: Partial<WatcherConfig>,
): WatcherInstance => {
	const config = createWatcherConfig(paths, override);
	return createFileWatcher(config);
};
