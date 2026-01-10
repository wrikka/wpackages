/**
 * DevTools integration for @wpackages/store
 * Connects stores to Redux DevTools extension for debugging
 */

import type { Store, MapStore } from "../types";

interface DevToolsMessage {
	type: string;
	payload?: unknown;
	state?: string;
}

interface DevToolsConfig {
	name?: string;
	enabled?: boolean;
	maxAge?: number;
}

const isBrowser = typeof window !== "undefined";
const devtoolsExt = isBrowser ? (window as unknown as { __REDUX_DEVTOOLS_EXTENSION__?: unknown }).__REDUX_DEVTOOLS_EXTENSION__ : null;

let storeIdCounter = 0;

/**
 * Connects a store to Redux DevTools
 * @param store The store to connect
 * @param config Configuration options
 * @returns Unsubscribe function
 */
export function connectDevTools<T>(
	store: Store<T>,
	config?: DevToolsConfig,
): () => void;
export function connectDevTools<T extends object>(
	store: MapStore<T>,
	config?: DevToolsConfig,
): () => void;
export function connectDevTools<T>(
	store: Store<T> | MapStore<T>,
	config: DevToolsConfig = {},
): () => void {
	if (!devtoolsExt) {
		return () => {};
	}

	const { name = `Store-${storeIdCounter++}`, enabled = true, maxAge = 50 } = config;

	if (!enabled) {
		return () => {};
	}

	const devtools = (devtoolsExt as { connect: (options: { name: string; maxAge: number }) => unknown }).connect({
		name,
		maxAge,
	}) as {
		send: (action: unknown, state: unknown) => void;
		subscribe: (listener: (message: DevToolsMessage) => void) => void;
		disconnect: () => void;
	};

	// Send initial state
	devtools.send({ type: "@@INIT" }, store.get());

	// Subscribe to store changes
	const unsubscribe = store.subscribe((value, oldValue) => {
		devtools.send(
			{
				type: "UPDATE",
				payload: { oldValue },
			},
			value,
		);
	});

	// Listen for DevTools commands (time-travel, reset, etc.)
	const listener = (message: DevToolsMessage) => {
		if (message.type === "DISPATCH" && message.payload) {
			const payload = message.payload as { type: string; state?: string };
			switch (payload.type) {
				case "JUMP_TO_STATE":
				case "JUMP_TO_ACTION":
					if (payload.state) {
						try {
							const newState = JSON.parse(payload.state);
							store.set(newState as T);
						} catch {
							// Ignore invalid state
						}
					}
					break;
				case "RESET":
					// Store will need to handle reset internally
					break;
				case "COMMIT":
					devtools.send({ type: "@@COMMIT" }, store.get());
					break;
				case "ROLLBACK":
					devtools.send({ type: "@@ROLLBACK" }, store.get());
					break;
			}
		}
	};

	devtools.subscribe(listener);

	return () => {
		unsubscribe();
		devtools.disconnect();
	};
}

/**
 * Check if DevTools is available
 */
export function isDevToolsAvailable(): boolean {
	return devtoolsExt !== null;
}
