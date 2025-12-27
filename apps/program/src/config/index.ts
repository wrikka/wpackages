/**
 * Config Module
 *
 * Configuration และ Plugin system สำหรับ effect
 */

export type {
	CacheConfig,
	ConcurrencyConfig,
	ConfigBuilder,
	ConfigManagerOptions,
	EffectConfig,
	EffectPlugin,
	PluginContext,
	PluginHooks,
} from "./types";

export { createConfigBuilder, defineConfig, mergeConfig } from "./define";

export { createPluginManager, EffectPluginManager } from "./plugins";

export {
	createProgramConfigManager,
	getConfig,
	initConfig,
	loadConfigFromFile,
	loadConfigWithManager,
	resetConfig,
	resolveConfig,
	setConfig,
} from "./loader";
