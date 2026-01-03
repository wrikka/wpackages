import type { Plugin, PluginEventEmitter, PluginManagerConfig, PluginRegistry, PluginState } from "../types";
import { createEventEmitter } from "../utils";
import { disablePlugin, enablePlugin, installPlugin, uninstallPlugin, updatePlugin } from "./manager/lifecycle";
import {
	countPlugins,
	getAllPlugins,
	getDisabledPlugins,
	getEnabledPlugins,
	getPlugin,
	hasPlugin,
} from "./manager/registry";

export type PluginResult =
	| { readonly _tag: "Success"; readonly value: undefined }
	| { readonly _tag: "Failure"; readonly error: string };

export interface PluginManager {
	readonly install: (plugin: Plugin) => Promise<PluginResult>;
	readonly uninstall: (pluginId: string) => Promise<PluginResult>;
	readonly enable: (pluginId: string) => Promise<PluginResult>;
	readonly disable: (pluginId: string) => Promise<PluginResult>;
	readonly update: (
		pluginId: string,
		newPlugin: Plugin,
	) => Promise<PluginResult>;
	readonly get: (pluginId: string) => PluginState | undefined;
	readonly getAll: () => readonly PluginState[];
	readonly getEnabled: () => readonly PluginState[];
	readonly getDisabled: () => readonly PluginState[];
	readonly has: (pluginId: string) => boolean;
	readonly count: () => number;
	readonly events: PluginEventEmitter;
}

export const createPluginManager = (
	config: PluginManagerConfig,
): PluginManager => {
	let registry: PluginRegistry = {};
	const eventEmitter = createEventEmitter();
	const apiHandlers = new Map<string, unknown>();
	const logger = config.logger;

	const install = async (plugin: Plugin): Promise<PluginResult> => {
		const { registry: newRegistry, result } = await installPlugin(plugin, registry, config, eventEmitter, logger);
		registry = newRegistry;
		if (result._tag === "Success" && config.loadOptions?.enableOnLoad) {
			return enable(plugin.metadata.id);
		}
		return result;
	};

	const uninstall = async (pluginId: string): Promise<PluginResult> => {
		if (registry[pluginId]?.status === "enabled") {
			await disable(pluginId);
		}
		const { registry: newRegistry, result } = await uninstallPlugin(pluginId, registry, eventEmitter);
		registry = newRegistry;
		return result;
	};

	const enable = async (pluginId: string): Promise<PluginResult> => {
		const { registry: newRegistry, result } = await enablePlugin(pluginId, registry, eventEmitter, apiHandlers, logger);
		registry = newRegistry;
		return result;
	};

	const disable = async (pluginId: string): Promise<PluginResult> => {
		const { registry: newRegistry, result } = await disablePlugin(pluginId, registry, eventEmitter);
		registry = newRegistry;
		return result;
	};

	const update = async (pluginId: string, newPlugin: Plugin): Promise<PluginResult> => {
		const { registry: newRegistry, result } = await updatePlugin(
			pluginId,
			newPlugin,
			registry,
			eventEmitter,
			logger,
			disable,
			enable,
		);
		registry = newRegistry;
		return result;
	};

	return Object.freeze({
		install,
		uninstall,
		enable,
		disable,
		update,
		get: (pluginId: string) => getPlugin(registry, pluginId),
		getAll: () => getAllPlugins(registry),
		getEnabled: () => getEnabledPlugins(registry),
		getDisabled: () => getDisabledPlugins(registry),
		has: (pluginId: string) => hasPlugin(registry, pluginId),
		count: () => countPlugins(registry),
		events: eventEmitter,
	});
};
