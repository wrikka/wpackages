/**
 * Mediator Pattern - Pure functional implementation
 */

import type { Message } from "../types";

export const createMediator = <T = unknown>() => {
	const handlers = new Map<string, Array<(payload: T) => void>>();

	return {
		subscribe: (type: string, handler: (payload: T) => void) => {
			if (!handlers.has(type)) {
				handlers.set(type, []);
			}
			handlers.get(type)?.push(handler);
			return () => {
				const typeHandlers = handlers.get(type);
				if (typeHandlers) {
					const index = typeHandlers.indexOf(handler);
					if (index > -1) {
						typeHandlers.splice(index, 1);
					}
				}
			};
		},
		send: (message: Message<T>) => {
			const typeHandlers = handlers.get(message.type);
			if (typeHandlers) {
				for (const handler of typeHandlers) {
					handler(message.payload);
				}
			}
		},
		clear: (type?: string) => {
			if (type) {
				handlers.delete(type);
			} else {
				handlers.clear();
			}
		},
	};
};
