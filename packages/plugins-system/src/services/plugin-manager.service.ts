import type {
	Plugin,
	PluginAPI,
	PluginEventEmitter,
	PluginManagerConfig,
	PluginRegistry,
	PluginState,
} from "../types";
import { buildDependencyGraph, createEventEmitter, detectCircularDependencies } from "../utils";

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

	const createPluginAPI = (pluginId: string): PluginAPI => ({
		emit: (event: string, data?: unknown) => {
			eventEmitter.emit({
				data,
				pluginId,
				timestamp: new Date(),
				type: `custom:${event}` as const,
			});
		},
		on: (event: string, handler: (data?: unknown) => void) => {
			eventEmitter.on(`custom:${event}` as const, handler);
		},
		register: (name: string, handler: unknown) => {
			apiHandlers.set(name, handler);
		},
		unregister: (name: string) => {
			apiHandlers.delete(name);
		},
	});

	const install = async (plugin: Plugin): Promise<PluginResult> => {
		const id = plugin.metadata.id;
		if (registry[id]) {
			throw new Error(`Plugin ${id} is already installed`);
		}

		const maxPlugins = config.maxPlugins ?? 100;
		if (Object.keys(registry).length >= maxPlugins) {
			throw new Error(`Maximum number of plugins (${maxPlugins}) reached`);
		}

		// Check circular dependencies
		const allPlugins = [
			...Object.values(registry).map((s) => s.plugin),
			plugin,
		];
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

			registry = { ...registry, [id]: state };

			await eventEmitter.emit({
				pluginId: id,
				timestamp: new Date(),
				type: "plugin:installed",
			});

			logger?.info("Plugin installed successfully", { pluginId: id });

			if (config.loadOptions?.enableOnLoad) {
				const enableResult = await enable(id);
				if (enableResult._tag === "Failure") {
					return enableResult;
				}
			}

			return { _tag: "Success", value: undefined };
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			logger?.error("Failed to install plugin", error, { pluginId: id });

			await eventEmitter.emit({
				data: error,
				pluginId: id,
				timestamp: new Date(),
				type: "plugin:error",
			});
			return { _tag: "Failure", error: errorMsg };
		}
	};

	const uninstall = async (pluginId: string): Promise<PluginResult> => {
		const state = registry[pluginId];
		if (!state) {
			return { _tag: "Failure", error: `Plugin ${pluginId} is not installed` };
		}

		if (state.status === "enabled") {
			const disableResult = await disable(pluginId);
			if (disableResult._tag === "Failure") {
				return disableResult;
			}
		}

		try {
			if (state.plugin.hooks?.onUninstall) {
				await state.plugin.hooks.onUninstall();
			}

			const { [pluginId]: _, ...rest } = registry;
			registry = rest;

			await eventEmitter.emit({
				pluginId,
				timestamp: new Date(),
				type: "plugin:uninstalled",
			});

			return { _tag: "Success", value: undefined };
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			await eventEmitter.emit({
				data: error,
				pluginId,
				timestamp: new Date(),
				type: "plugin:error",
			});
			return { _tag: "Failure", error: errorMsg };
		}
	};

	const enable = async (pluginId: string): Promise<PluginResult> => {
		const state = registry[pluginId];
		if (!state) {
			return { _tag: "Failure", error: `Plugin ${pluginId} is not installed` };
		}

		if (state.status === "enabled") {
			return { _tag: "Success", value: undefined };
		}

		try {
			logger?.info("Enabling plugin", { pluginId });

			const api = createPluginAPI(pluginId);
			await state.plugin.init(api);

			if (state.plugin.hooks?.onEnable) {
				await state.plugin.hooks.onEnable();
			}

			registry = {
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
			return { _tag: "Success", value: undefined };
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			logger?.error("Failed to enable plugin", error, { pluginId });

			registry = {
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
			return { _tag: "Failure", error: errorMsg };
		}
	};

	const disable = async (pluginId: string): Promise<PluginResult> => {
		const state = registry[pluginId];
		if (!state) {
			return { _tag: "Failure", error: `Plugin ${pluginId} is not installed` };
		}

		if (state.status !== "enabled") {
			return { _tag: "Success", value: undefined };
		}

		try {
			if (state.plugin.hooks?.onDisable) {
				await state.plugin.hooks.onDisable();
			}

			registry = {
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

			return { _tag: "Success", value: undefined };
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			await eventEmitter.emit({
				data: error,
				pluginId,
				timestamp: new Date(),
				type: "plugin:error",
			});
			return { _tag: "Failure", error: errorMsg };
		}
	};

	const get = (pluginId: string): PluginState | undefined => {
		return registry[pluginId];
	};

	const getAll = (): readonly PluginState[] => {
		return Object.freeze(Object.values(registry));
	};

	const getEnabled = (): readonly PluginState[] => {
		return Object.freeze(
			Object.values(registry).filter((s) => s.status === "enabled"),
		);
	};

	const getDisabled = (): readonly PluginState[] => {
		return Object.freeze(
			Object.values(registry).filter((s) => s.status === "disabled"),
		);
	};

	const update = async (
		pluginId: string,
		newPlugin: Plugin,
	): Promise<PluginResult> => {
		const state = registry[pluginId];
		if (!state) {
			return { _tag: "Failure", error: `Plugin ${pluginId} is not installed` };
		}

		const oldVersion = state.plugin.metadata.version;
		const newVersion = newPlugin.metadata.version;

		if (oldVersion === newVersion) {
			return { _tag: "Failure", error: `Plugin ${pluginId} is already at version ${newVersion}` };
		}

		const wasEnabled = state.status === "enabled";

		// Disable if enabled
		if (wasEnabled) {
			const disableResult = await disable(pluginId);
			if (disableResult._tag === "Failure") {
				return disableResult;
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
			registry = {
				...registry,
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
				const enableResult = await enable(pluginId);
				if (enableResult._tag === "Failure") {
					return enableResult;
				}
			}

			return { _tag: "Success", value: undefined };
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			logger?.error("Failed to update plugin", error, { pluginId });
			return { _tag: "Failure", error: errorMsg };
		}
	};

	const has = (pluginId: string): boolean => {
		return pluginId in registry;
	};

	const count = (): number => {
		return Object.keys(registry).length;
	};

	return Object.freeze({
		count,
		disable,
		enable,
		events: eventEmitter,
		get,
		getAll,
		getDisabled,
		getEnabled,
		has,
		install,
		uninstall,
		update,
	});
};
