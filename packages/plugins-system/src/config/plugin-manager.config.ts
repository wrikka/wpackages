import { DEFAULT_CONFIG } from "../constant";
import type { PluginManagerConfig } from "../types";

export const createPluginManagerConfig = (
	overrides?: Partial<PluginManagerConfig>,
): Readonly<Required<PluginManagerConfig>> => {
	return Object.freeze({
		...DEFAULT_CONFIG,
		...overrides,
		discoveryOptions: Object.freeze({
			...DEFAULT_CONFIG.discoveryOptions,
			...overrides?.discoveryOptions,
		}),
		loadOptions: Object.freeze({
			...DEFAULT_CONFIG.loadOptions,
			...overrides?.loadOptions,
		}),
	});
};

export const validateConfig = (
	config: PluginManagerConfig,
): readonly string[] => {
	const errors: string[] = [];

	if (!config.pluginDir || config.pluginDir.trim() === "") {
		errors.push("pluginDir is required and cannot be empty");
	}

	if (config.maxPlugins !== undefined && config.maxPlugins < 1) {
		errors.push("maxPlugins must be at least 1");
	}

	if (
		config.discoveryOptions?.paths
		&& config.discoveryOptions.paths.length === 0
	) {
		errors.push("discoveryOptions.paths cannot be empty array");
	}

	return Object.freeze(errors);
};
