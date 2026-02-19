import { DEFAULT_VITEXT_CONFIG } from "../constant/defaults";
import { ConfigLoader } from "../services/config-loader";
import { configError, err, isSuccess, ok, type Result, type VitextError } from "../services/error-handler";
import type { VitextConfig } from "../types/config";

/**
 * Create a Vitext configuration
 */
export const createConfig = async (config?: Partial<VitextConfig>): Promise<Result<VitextError, VitextConfig>> => {
	try {
		// If no config provided, try to load from file
		if (!config) {
			const loadedConfig = await ConfigLoader.loadConfig();
			return ok(loadedConfig);
		}

		const finalConfig: VitextConfig = {
			...DEFAULT_VITEXT_CONFIG,
			...config,
			server: {
				...DEFAULT_VITEXT_CONFIG.server,
				...config.server,
			},
			build: {
				...DEFAULT_VITEXT_CONFIG.build,
				...config.build,
			},
			plugins: config.plugins ?? DEFAULT_VITEXT_CONFIG.plugins,
			rolldown: {
				...DEFAULT_VITEXT_CONFIG.rolldown,
				...config.rolldown,
			},
		};

		// Validate config
		if (finalConfig.server.port < 1 || finalConfig.server.port > 65535) {
			return err(configError(`Invalid port: ${finalConfig.server.port}. Port must be between 1 and 65535.`));
		}

		// Validate using config loader
		if (!ConfigLoader.validateConfig(finalConfig)) {
			return err(configError("Invalid configuration"));
		}

		return ok(finalConfig);
	} catch (error) {
		return err(configError("Failed to create configuration", error));
	}
};

const defaultConfigResult = await createConfig();
export const defaultConfig = Object.freeze(
	isSuccess(defaultConfigResult) ? defaultConfigResult.value : DEFAULT_VITEXT_CONFIG,
);

/**
 * Define configuration with type safety
 */
export const defineConfig = (config: Partial<VitextConfig>): VitextConfig => {
	return {
		...DEFAULT_VITEXT_CONFIG,
		...config,
		server: {
			...DEFAULT_VITEXT_CONFIG.server,
			...config.server,
		},
		build: {
			...DEFAULT_VITEXT_CONFIG.build,
			...config.build,
		},
		plugins: config.plugins ?? DEFAULT_VITEXT_CONFIG.plugins,
		rolldown: {
			...DEFAULT_VITEXT_CONFIG.rolldown,
			...config.rolldown,
		},
	};
};
