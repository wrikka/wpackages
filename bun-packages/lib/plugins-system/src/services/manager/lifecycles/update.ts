import type { Plugin, PluginEventEmitter, PluginManagerConfig, PluginRegistry } from "../../../types";
import type { PluginResult } from "../plugin-manager.service";

export const updatePlugin = async (
	pluginId: string,
	newPlugin: Plugin,
	registry: PluginRegistry,
	eventEmitter: PluginEventEmitter,
	logger: PluginManagerConfig["logger"],
	disableFn: (pluginId: string) => Promise<{ registry: PluginRegistry; result: PluginResult }>,
	enableFn: (pluginId: string) => Promise<{ registry: PluginRegistry; result: PluginResult }>,
): Promise<{ registry: PluginRegistry; result: PluginResult }> => {
	const state = registry[pluginId];
	if (!state) {
		return { registry, result: { _tag: "Failure", error: `Plugin ${pluginId} is not installed` } };
	}

	const oldVersion = state.plugin.metadata.version;
	const newVersion = newPlugin.metadata.version;

	if (oldVersion === newVersion) {
		return { registry, result: { _tag: "Failure", error: `Plugin ${pluginId} is already at version ${newVersion}` } };
	}

	const wasEnabled = state.status === "enabled";
	let currentRegistry = registry;

	// Disable if enabled
	if (wasEnabled) {
		const disableResult = await disableFn(pluginId);
		currentRegistry = disableResult.registry;
		if (disableResult.result._tag === "Failure") {
			return { registry: currentRegistry, result: disableResult.result };
		}
	}

	try {
		logger?.info("Updating plugin", {
			pluginId,
			oldVersion,
			newVersion,
		});

		// Call onUpdate hook if exists
		if (newPlugin.hooks?.onUpdate) {
			await newPlugin.hooks.onUpdate(oldVersion);
		}

		// Update registry
		currentRegistry = {
			...currentRegistry,
			[pluginId]: {
				...state,
				plugin: newPlugin,
			},
		};

		await eventEmitter.emit({
			data: { oldVersion, newVersion },
			pluginId,
			timestamp: new Date(),
			type: "plugin:updated" as const,
		});

		logger?.info("Plugin updated successfully", {
			pluginId,
			newVersion,
		});

		// Re-enable if was enabled
		if (wasEnabled) {
			const enableResult = await enableFn(pluginId);
			currentRegistry = enableResult.registry;
			if (enableResult.result._tag === "Failure") {
				return { registry: currentRegistry, result: enableResult.result };
			}
		}

		return { registry: currentRegistry, result: { _tag: "Success", value: undefined } };
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		logger?.error("Failed to update plugin", error, { pluginId });
		return { registry, result: { _tag: "Failure", error: errorMsg } };
	}
};
