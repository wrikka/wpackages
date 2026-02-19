import { createPluginLogger } from "../config";
import type { PluginManagerConfig } from "../types";

export const DEFAULT_PLUGIN_DIR = "./plugins" as const;

export const DEFAULT_CACHE_DIR = "./.plugin-cache" as const;

export const DEFAULT_MAX_PLUGINS = 100 as const;

export const DEFAULT_PLUGIN_PATTERNS = [
	"**/*.plugin.js",
	"**/*.plugin.ts",
] as const;

export const DEFAULT_CONFIG: Readonly<Required<PluginManagerConfig>> = Object.freeze({
	allowRemote: false,
	cacheDir: DEFAULT_CACHE_DIR,
	discoveryOptions: {
		autoLoad: true,
		paths: [DEFAULT_PLUGIN_DIR],
		patterns: DEFAULT_PLUGIN_PATTERNS,
	},
	loadOptions: {
		enableOnLoad: false,
		skipDependencies: false,
		validate: true,
	},
	logger: createPluginLogger(),
	maxPlugins: DEFAULT_MAX_PLUGINS,
	pluginDir: DEFAULT_PLUGIN_DIR,
});
