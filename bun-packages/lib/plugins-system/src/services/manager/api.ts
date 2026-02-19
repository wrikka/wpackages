import type { PluginAPI, PluginEventEmitter } from "../../types";

export const createPluginAPI = (
	pluginId: string,
	eventEmitter: PluginEventEmitter,
	apiHandlers: Map<string, unknown>,
): PluginAPI => ({
	emit: (event: string, data?: unknown) => {
		void eventEmitter.emit({
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
