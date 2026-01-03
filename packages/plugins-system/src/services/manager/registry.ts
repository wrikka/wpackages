import type { PluginRegistry, PluginState } from "../../types";

export const getPlugin = (registry: PluginRegistry, pluginId: string): PluginState | undefined => {
	return registry[pluginId];
};

export const getAllPlugins = (registry: PluginRegistry): readonly PluginState[] => {
	return Object.freeze(Object.values(registry));
};

export const getEnabledPlugins = (registry: PluginRegistry): readonly PluginState[] => {
	return Object.freeze(
		Object.values(registry).filter((s) => s.status === "enabled"),
	);
};

export const getDisabledPlugins = (registry: PluginRegistry): readonly PluginState[] => {
	return Object.freeze(
		Object.values(registry).filter((s) => s.status === "disabled"),
	);
};

export const hasPlugin = (registry: PluginRegistry, pluginId: string): boolean => {
	return pluginId in registry;
};

export const countPlugins = (registry: PluginRegistry): number => {
	return Object.keys(registry).length;
};
