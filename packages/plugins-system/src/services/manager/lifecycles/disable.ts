import type { PluginEventEmitter, PluginRegistry } from "../../../types";
import type { PluginResult } from "../plugin-manager.service";

export const disablePlugin = async (
	pluginId: string,
	registry: PluginRegistry,
	eventEmitter: PluginEventEmitter,
): Promise<{ registry: PluginRegistry; result: PluginResult }> => {
	const state = registry[pluginId];
	if (!state) {
		return { registry, result: { _tag: "Failure", error: `Plugin ${pluginId} is not installed` } };
	}

	if (state.status !== "enabled") {
		return { registry, result: { _tag: "Success", value: undefined } };
	}

	try {
		if (state.plugin.hooks?.onDisable) {
			await state.plugin.hooks.onDisable();
		}

		const newRegistry = {
			...registry,
			[pluginId]: {
				...state,
				status: "disabled",
			},
		};

		await eventEmitter.emit({
			pluginId,
			timestamp: new Date(),
			type: "plugin:disabled",
		});

		return { registry: newRegistry, result: { _tag: "Success", value: undefined } };
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		await eventEmitter.emit({
			data: error,
			pluginId,
			timestamp: new Date(),
			type: "plugin:error",
		});
		return { registry, result: { _tag: "Failure", error: errorMsg } };
	}
};
