/**
 * Config Definition
 *
 * Helper สำหรับสร้าง Program config
 */

import type {
	CacheConfig,
	ConcurrencyConfig,
	ConfigBuilder,
	ConfigManagerOptions,
	EffectConfig,
	EffectPlugin,
} from "./types";

/**
 * defineConfig - สร้าง config แบบ type-safe
 *
 * @example
 * ```ts
 * import { defineConfig } from 'program';
 *
 * export default defineConfig({
 *   cache: {
 *     enabled: true,
 *     maxSize: 1000,
 *     ttl: 60000,
 *     evictionPolicy: 'lru',
 *   },
 *   concurrency: {
 *     maxConcurrent: 10,
 *     queueSize: 100,
 *   },
 *   configManager: {
 *     enabled: true,
 *     watch: true,
 *     expandVariables: true,
 *   },
 *   plugins: [myPlugin()],
 * });
 * ```
 */
export const defineConfig = (config: EffectConfig): EffectConfig => {
	return config;
};

/**
 * createConfigBuilder - Builder pattern สำหรับ config
 *
 * @example
 * ```ts
 * const config = createConfigBuilder()
 *   .cache({ enabled: true, maxSize: 1000 })
 *   .concurrency({ maxConcurrent: 10 })
 *   .configManager({ enabled: true, watch: true })
 *   .plugin(myPlugin())
 *   .build();
 * ```
 */
export const createConfigBuilder = (): ConfigBuilder => {
	let currentConfig: EffectConfig = {};

	const builder: ConfigBuilder = {
		cache: (config: CacheConfig) => {
			currentConfig = {
				...currentConfig,
				cache: {
					...currentConfig.cache,
					...config,
				},
			};
			return builder;
		},

		concurrency: (config: ConcurrencyConfig) => {
			currentConfig = {
				...currentConfig,
				concurrency: {
					...currentConfig.concurrency,
					...config,
				},
			};
			return builder;
		},

		plugin: (plugin: EffectPlugin) => {
			currentConfig = {
				...currentConfig,
				plugins: [...(currentConfig.plugins ?? []), plugin],
			};
			return builder;
		},

		configManager: (config: ConfigManagerOptions) => {
			currentConfig = {
				...currentConfig,
				configManager: {
					...currentConfig.configManager,
					...config,
				},
			};
			return builder;
		},

		build: () => currentConfig,
	};

	return builder;
};

/**
 * mergeConfig - รวม configs หลายตัว
 */
export const mergeConfig = (...configs: EffectConfig[]): EffectConfig => {
	return configs.reduce<EffectConfig>(
		(acc, config) => ({
			...acc,
			...config,
			cache: {
				...acc.cache,
				...config.cache,
			},
			concurrency: {
				...acc.concurrency,
				...config.concurrency,
			},
			configManager: {
				...acc.configManager,
				...config.configManager,
			},
			plugins: [...(acc.plugins ?? []), ...(config.plugins ?? [])],
		}),
		{},
	);
};
