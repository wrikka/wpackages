import type { PluginEventEmitter, PluginManagerConfig, PluginRegistry } from "../../../types";
import { createPluginAPI } from "../api";
import type { PluginResult } from "../plugin-manager.service";

export const enablePlugin = async (
	pluginId: string,
	registry: PluginRegistry,
	eventEmitter: PluginEventEmitter,
	apiHandlers: Map<string, unknown>,
	logger: PluginManagerConfig["logger"],
): Promise<{ registry: PluginRegistry; result: PluginResult }> => {
	const state = registry[pluginId];
	if (!state) {
		return { registry, result: { _tag: "Failure", error: `Plugin ${pluginId} is not installed` } };
	}

	if (state.status === "enabled") {
		return { registry, result: { _tag: "Success", value: undefined } };
	}

	try {
		logger?.info("Enabling plugin", { pluginId });

		const api = createPluginAPI(pluginId, eventEmitter, apiHandlers);
		await state.plugin.init(api);

		if (state.plugin.hooks?.onEnable) {
			await state.plugin.hooks.onEnable();
		}

		const newRegistry = {
			...registry,
			[pluginId]: {
				...state,
				enabledAt: new Date(),
				status: "enabled",
			},
		};

		await eventEmitter.emit({
			pluginId,
			timestamp: new Date(),
			type: "plugin:enabled",
		});

		logger?.info("Plugin enabled successfully", { pluginId });
		return { registry: newRegistry, result: { _tag: "Success", value: undefined } };
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		logger?.error("Failed to enable plugin", error, { pluginId });

		const newRegistry = {
			...registry,
			[pluginId]: {
				...state,
				error: error instanceof Error ? error : new Error(String(error)),
				status: "error",
			},
		};

		await eventEmitter.emit({
			data: error,
			pluginId,
			timestamp: new Date(),
			type: "plugin:error",
		});
		return { registry: newRegistry, result: { _tag: "Failure", error: errorMsg } };
	}
};
