import type { WatchHandler } from "../types";

type EventHandlers = Map<string, Set<WatchHandler>>;

export const createEventEmitter = () => {
	const handlers: EventHandlers = new Map();

	const on = (event: string, handler: WatchHandler): void => {
		if (!handlers.has(event)) {
			handlers.set(event, new Set());
		}
		handlers.get(event)?.add(handler);
	};

	const once = (event: string, handler: WatchHandler): void => {
		const wrappedHandler: WatchHandler = async (data) => {
			await handler(data);
			off(event, wrappedHandler);
		};
		on(event, wrappedHandler);
	};

	const off = (event: string, handler?: WatchHandler): void => {
		if (!handler) {
			handlers.delete(event);
			return;
		}

		const eventHandlers = handlers.get(event);
		if (eventHandlers) {
			eventHandlers.delete(handler);
			if (eventHandlers.size === 0) {
				handlers.delete(event);
			}
		}
	};

	const emit = async (event: string, data: unknown): Promise<void> => {
		const eventHandlers = handlers.get(event);
		if (!eventHandlers) return;

		const promises = Array.from(eventHandlers).map((handler) => Promise.resolve(handler(data as any)));

		await Promise.allSettled(promises);
	};

	const removeAllListeners = (): void => {
		handlers.clear();
	};

	const listenerCount = (event: string): number => {
		return handlers.get(event)?.size ?? 0;
	};

	return {
		emit,
		listenerCount,
		off,
		on,
		once,
		removeAllListeners,
	};
};

export type EventEmitter = ReturnType<typeof createEventEmitter>;
