import type { Plugin, PluginLoadOptions } from "../types";
import { getLoadOrder, validatePlugin } from "../utils";

export type PluginLoadResult = 
	| { readonly _tag: "Success"; readonly value: Plugin }
	| { readonly _tag: "Failure"; readonly error: string };

export const loadPlugin = async (
	pluginPath: string,
	options?: PluginLoadOptions,
): Promise<PluginLoadResult> => {
	try {
		const pluginModule = await import(pluginPath);
		const plugin: Plugin = pluginModule.default || pluginModule;

		if (!plugin || typeof plugin !== "object") {
			return {
				_tag: "Failure",
				error: "Plugin must export a valid plugin object",
			};
		}

		if (options?.validate !== false) {
			const validationErrors = validatePlugin(plugin);
			if (validationErrors.length > 0) {
				return {
					_tag: "Failure",
					error: validationErrors.join("; "),
				};
			}
		}

		return {
			_tag: "Success",
			value: plugin,
		};
	} catch (error) {
		return {
			_tag: "Failure",
			error: `Failed to load plugin from ${pluginPath}: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
};

export const loadPlugins = async (
	pluginPaths: readonly string[],
	options?: PluginLoadOptions,
): Promise<readonly PluginLoadResult[]> => {
	const results = await Promise.all(
		pluginPaths.map((path) => loadPlugin(path, options)),
	);

	return Object.freeze(results);
};

export const sortPluginsByDependencies = (
	plugins: readonly Plugin[],
): readonly Plugin[] => {
	return getLoadOrder(plugins);
};
