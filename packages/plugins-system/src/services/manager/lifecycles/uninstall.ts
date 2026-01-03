import type { PluginEventEmitter, PluginRegistry } from "../../types";
import type { PluginResult } from "../plugin-manager.service";

export const uninstallPlugin = async (
	pluginId: string,
	registry: PluginRegistry,
	eventEmitter: PluginEventEmitter,
): Promise<{ registry: PluginRegistry; result: PluginResult }> => {
	const state = registry[pluginId];
	if (!state) {
		return { registry, result: { _tag: "Failure", error: `Plugin ${pluginId} is not installed` } };
	}

	try {
		if (state.plugin.hooks?.onUninstall) {
			await state.plugin.hooks.onUninstall();
		}

		const { [pluginId]: _, ...rest } = registry;

		await eventEmitter.emit({
			pluginId,
			timestamp: new Date(),
			type: "plugin:uninstalled",
		});

		return { registry: rest, result: { _tag: "Success", value: undefined } };
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
