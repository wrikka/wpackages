import type { PluginEvent, PluginEventEmitter, PluginEventHandler, PluginEventType } from "../types";

export const createEventEmitter = (): PluginEventEmitter => {
	const listeners = new Map<PluginEventType, Set<PluginEventHandler>>();
	const onceListeners = new Map<PluginEventType, Set<PluginEventHandler>>();

	const on = <T = unknown>(
		type: PluginEventType,
		handler: PluginEventHandler<T>,
	): void => {
		if (!listeners.has(type)) {
			listeners.set(type, new Set());
		}
		listeners.get(type)?.add(handler as PluginEventHandler);
	};

	const off = <T = unknown>(
		type: PluginEventType,
		handler: PluginEventHandler<T>,
	): void => {
		listeners.get(type)?.delete(handler as PluginEventHandler);
		onceListeners.get(type)?.delete(handler as PluginEventHandler);
	};

	const emit = async <T = unknown>(event: PluginEvent<T>): Promise<void> => {
		const handlers = listeners.get(event.type) ?? new Set();
		const onceHandlers = onceListeners.get(event.type) ?? new Set();

		const allHandlers = [...handlers, ...onceHandlers];

		await Promise.all(allHandlers.map((handler) => handler(event)));

		if (onceHandlers.size > 0) {
			onceListeners.delete(event.type);
		}
	};

	const once = <T = unknown>(
		type: PluginEventType,
		handler: PluginEventHandler<T>,
	): void => {
		if (!onceListeners.has(type)) {
			onceListeners.set(type, new Set());
		}
		onceListeners.get(type)?.add(handler as PluginEventHandler);
	};

	return Object.freeze({
		emit,
		off,
		on,
		once,
	});
};
