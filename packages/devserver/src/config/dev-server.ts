import {
	DEFAULT_CACHE_TTL,
	DEFAULT_DEBOUNCE_MS,
	DEFAULT_HOSTNAME,
	DEFAULT_IGNORED_PATTERNS,
	DEFAULT_PORT,
	DEFAULT_ROOT,
} from "../constant";
import type { DevServerConfig } from "../types";

export const createDevServerConfig = (
	config: Partial<DevServerConfig> = {},
): DevServerConfig => ({
	root: config.root ?? DEFAULT_ROOT,
	port: config.port ?? DEFAULT_PORT,
	hostname: config.hostname ?? DEFAULT_HOSTNAME,
	watch: {
		ignored: config.watch?.ignored ?? [...DEFAULT_IGNORED_PATTERNS],
		debounceMs: config.watch?.debounceMs ?? DEFAULT_DEBOUNCE_MS,
		...config.watch,
	},
	cache: {
		ttl: config.cache?.ttl ?? DEFAULT_CACHE_TTL,
		...config.cache,
	},
	server: {
		middleware: config.server?.middleware ?? [],
		...config.server,
	},
});
