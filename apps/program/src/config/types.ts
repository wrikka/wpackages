/**
 * Config Types
 *
 * Type definitions สำหรับ Program config system
 */

/**
 * Program Configuration
 */
export interface EffectConfig {
	readonly cache?: CacheConfig;
	readonly concurrency?: ConcurrencyConfig;
	readonly plugins?: ReadonlyArray<EffectPlugin>;
	readonly configManager?: ConfigManagerOptions;
}

/**
 * Config Manager Options
 */
export interface ConfigManagerOptions {
	readonly enabled?: boolean;
	readonly schema?: Record<string, unknown>;
	readonly watch?: boolean;
	readonly expandVariables?: boolean;
	readonly configFile?: string;
}

/**
 * Cache Configuration
 */
export interface CacheConfig {
	readonly enabled?: boolean;
	readonly maxSize?: number;
	readonly ttl?: number;
	readonly evictionPolicy?: "lru" | "lfu" | "fifo";
}

/**
 * Concurrency Configuration
 */
export interface ConcurrencyConfig {
	readonly maxConcurrent?: number;
	readonly queueSize?: number;
}

/**
 * Plugin Interface
 */
export interface EffectPlugin {
	readonly name: string;
	readonly version?: string;
	readonly setup?: (context: PluginContext) => void | Promise<void>;
	readonly hooks?: PluginHooks;
}

/**
 * Plugin Context
 */
export interface PluginContext {
	readonly config: EffectConfig;
	readonly registerHook: <K extends keyof PluginHooks>(
		name: K,
		handler: NonNullable<PluginHooks[K]>,
	) => void;
}

/**
 * Plugin Hooks
 */
export interface PluginHooks {
	readonly beforeProgram?: (program: unknown) => void | Promise<void>;
	readonly afterProgram?: (result: unknown) => void | Promise<void>;
	readonly onError?: (error: Error) => void | Promise<void>;
	readonly onSuccess?: (value: unknown) => void | Promise<void>;
}

/**
 * Config Builder
 */
export interface ConfigBuilder {
	readonly cache: (config: CacheConfig) => ConfigBuilder;
	readonly concurrency: (config: ConcurrencyConfig) => ConfigBuilder;
	readonly plugin: (plugin: EffectPlugin) => ConfigBuilder;
	readonly configManager: (config: ConfigManagerOptions) => ConfigBuilder;
	readonly build: () => EffectConfig;
}
