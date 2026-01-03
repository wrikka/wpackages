import type { Plugin, PluginEventEmitter, PluginManagerConfig, PluginRegistry, PluginState } from "../../types";
import { buildDependencyGraph, detectCircularDependencies } from "../../utils";
import type { PluginResult } from "../plugin-manager.service";

export const installPlugin = async (
	plugin: Plugin,
	registry: PluginRegistry,
	config: PluginManagerConfig,
	eventEmitter: PluginEventEmitter,
	logger: PluginManagerConfig["logger"],
): Promise<{ registry: PluginRegistry; result: PluginResult }> => {
	const id = plugin.metadata.id;
	if (registry[id]) {
		throw new Error(`Plugin ${id} is already installed`);
	}

	const maxPlugins = config.maxPlugins ?? 100;
	if (Object.keys(registry).length >= maxPlugins) {
		throw new Error(`Maximum number of plugins (${maxPlugins}) reached`);
	}

	// Check circular dependencies
	const allPlugins = [...Object.values(registry).map((s) => s.plugin), plugin];
	const graph = buildDependencyGraph(allPlugins);
	const cycles = detectCircularDependencies(graph);

	if (cycles.length > 0) {
		const cycle = Array.isArray(cycles[0]) ? cycles[0].join(" -> ") : String(cycles[0]);
		throw new Error(`Circular dependency detected: ${cycle}`);
	}

	try {
		logger?.info("Installing plugin", {
			pluginId: id,
			version: plugin.metadata.version,
		});

		if (plugin.hooks?.onInstall) {
			await plugin.hooks.onInstall();
		}

		const state: PluginState = {
			installedAt: new Date(),
			plugin,
			status: "installed",
		};

		const newRegistry = { ...registry, [id]: state };

		await eventEmitter.emit({
			pluginId: id,
			timestamp: new Date(),
			type: "plugin:installed",
		});

		logger?.info("Plugin installed successfully", { pluginId: id });

		return { registry: newRegistry, result: { _tag: "Success", value: undefined } };
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		logger?.error("Failed to install plugin", error, { pluginId: id });

		await eventEmitter.emit({
			data: error,
			pluginId: id,
			timestamp: new Date(),
			type: "plugin:error",
		});
		return { registry, result: { _tag: "Failure", error: errorMsg } };
	}
};
