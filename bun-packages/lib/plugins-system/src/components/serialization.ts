/**
 * Serialization Component
 * Pure functions for serializing and deserializing plugin registry
 */

import type { PluginRegistry, PluginState } from "../types";

/**
 * Serialize plugin registry for storage
 * @param registry - Plugin registry to serialize
 * @returns Serializable object
 */
export const serializeRegistry = (registry: PluginRegistry): unknown => {
	const entries = Object.entries(registry).map(([id, state]) => [
		id,
		{
			enabledAt: state.enabledAt?.toISOString(),
			error: state.error?.message,
			installedAt: state.installedAt.toISOString(),
			plugin: { metadata: state.plugin.metadata },
			status: state.status,
		},
	]);
	return Object.fromEntries(entries);
};

/**
 * Deserialize plugin registry from storage
 * @param data - Serialized data
 * @returns Plugin registry
 */
export const deserializeRegistry = (data: unknown): PluginRegistry => {
	if (typeof data !== "object" || data === null) {
		return {};
	}

	const entries = Object.entries(data as Record<string, unknown>).map(
		([id, stateData]) => {
			const state = stateData as {
				status: string;
				installedAt: string;
				enabledAt?: string;
				error?: string;
				plugin: {
					metadata: {
						id: string;
						name: string;
						version: string;
						description: string;
						author: string;
					};
				};
			};

			const pluginState: PluginState = {
				installedAt: new Date(state.installedAt),
				plugin: {
					metadata: state.plugin.metadata,
					init: async () => {},
				},
				status: state.status as PluginState["status"],
			};
			if (state.enabledAt) {
				(pluginState as { enabledAt: Date }).enabledAt = new Date(
					state.enabledAt,
				);
			}

			return [id, pluginState];
		},
	);

	return Object.fromEntries(entries) as PluginRegistry;
};

/**
 * Convert registry to JSON string
 * @param registry - Plugin registry
 * @returns JSON string
 */
export const registryToJson = (registry: PluginRegistry): string => {
	return JSON.stringify(serializeRegistry(registry), null, 2);
};

/**
 * Convert JSON string to registry
 * @param json - JSON string
 * @returns Plugin registry
 */
export const jsonToRegistry = (json: string): PluginRegistry => {
	const parsed = JSON.parse(json);
	return deserializeRegistry(parsed);
};
