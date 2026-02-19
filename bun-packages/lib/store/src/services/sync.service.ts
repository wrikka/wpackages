/**
 * State synchronization for @wpackages/store
 * Sync state between tabs/windows and with server
 */

import type { Store } from "../types";

export interface SyncMessage<T> {
	type: "update" | "request" | "response";
	key: string;
	value?: T;
	timestamp: number;
	source: string;
}

export interface SyncConflictResolver<T> {
	resolve(local: T, remote: T): T;
}

export interface SyncQueueItem<T> {
	type: "update" | "delete";
	key: string;
	value?: T;
	timestamp: number;
}

/**
 * BroadcastChannel adapter for sync
 */
export class BroadcastChannelAdapter<T> {
	private channel: BroadcastChannel;
	private listeners: Set<(message: SyncMessage<T>) => void> = new Set();

	constructor(channelName: string) {
		this.channel = new BroadcastChannel(channelName);
		this.channel.onmessage = (event) => {
			this.notify(event.data as SyncMessage<T>);
		};
	}

	post(message: SyncMessage<T>): void {
		this.channel.postMessage(message);
	}

	subscribe(listener: (message: SyncMessage<T>) => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(message: SyncMessage<T>): void {
		for (const listener of this.listeners) {
			listener(message);
		}
	}

	close(): void {
		this.channel.close();
	}
}

/**
 * WebSocket adapter for sync
 */
export class WebSocketAdapter<T> {
	private ws: WebSocket | null = null;
	private url: string;
	private listeners: Set<(message: SyncMessage<T>) => void> = new Set();
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;

	constructor(url: string) {
		this.url = url;
	}

	connect(): void {
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			this.reconnectAttempts = 0;
		};

		this.ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as SyncMessage<T>;
				this.notify(message);
			} catch {
				// Ignore invalid messages
			}
		};

		this.ws.onclose = () => {
			this.attemptReconnect();
		};

		this.ws.onerror = () => {
			this.ws?.close();
		};
	}

	private attemptReconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			setTimeout(() => {
				this.connect();
			}, this.reconnectDelay * this.reconnectAttempts);
		}
	}

	send(message: SyncMessage<T>): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		}
	}

	subscribe(listener: (message: SyncMessage<T>) => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(message: SyncMessage<T>): void {
		for (const listener of this.listeners) {
			listener(message);
		}
	}

	disconnect(): void {
		this.ws?.close();
		this.ws = null;
	}
}

/**
 * Sync queue for managing sync operations
 */
export class SyncQueue<T> {
	private queue: SyncQueueItem<T>[] = [];
	private processing = false;

	enqueue(item: SyncQueueItem<T>): void {
		this.queue.push(item);
		void this.process();
	}

	async process(): Promise<void> {
		if (this.processing || this.queue.length === 0) {
			return;
		}

		this.processing = true;

		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (item) {
				await this.processItem(item);
			}
		}

		this.processing = false;
	}

	private async processItem(_item: SyncQueueItem<T>): Promise<void> {
		// Override in subclasses
	}
}

/**
 * Creates a sync middleware
 * @param channelName The channel name for sync
 * @param conflictResolver Conflict resolver function
 * @returns Middleware function
 */
export function syncMiddleware<T>(
	channelName: string,
	conflictResolver?: SyncConflictResolver<T>,
) {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const adapter = new BroadcastChannelAdapter<T>(channelName);
		const sourceId = Math.random().toString(36).substring(2, 9);

		adapter.subscribe((message) => {
			if (message.source === sourceId) {
				return;
			}

			if (message.type === "update" && message.value !== undefined) {
				const current = context.getState();

				if (conflictResolver) {
					const resolved = conflictResolver.resolve(current, message.value);
					context.setState(resolved);
				} else {
					context.setState(message.value);
				}
			}
		});

		const originalSet = context.setState;

		return {
			...context,
			setState: (value: T) => {
				originalSet(value);
				adapter.post({
					type: "update",
					key: channelName,
					value,
					timestamp: Date.now(),
					source: sourceId,
				});
			},
		};
	};
}

/**
 * Creates a WebSocket sync middleware
 * @param url WebSocket URL
 * @param conflictResolver Conflict resolver function
 * @returns Middleware function
 */
export function webSocketSyncMiddleware<T>(
	url: string,
	conflictResolver?: SyncConflictResolver<T>,
) {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const adapter = new WebSocketAdapter<T>(url);
		const sourceId = Math.random().toString(36).substring(2, 9);

		adapter.subscribe((message) => {
			if (message.source === sourceId) {
				return;
			}

			if (message.type === "update" && message.value !== undefined) {
				const current = context.getState();

				if (conflictResolver) {
					const resolved = conflictResolver.resolve(current, message.value);
					context.setState(resolved);
				} else {
					context.setState(message.value);
				}
			}
		});

		adapter.connect();

		const originalSet = context.setState;

		return {
			...context,
			setState: (value: T) => {
				originalSet(value);
				adapter.send({
					type: "update",
					key: "state",
					value,
					timestamp: Date.now(),
					source: sourceId,
				});
			},
		};
	};
}

/**
 * Creates a last-write-wins conflict resolver
 * @returns Conflict resolver
 */
export function lastWriteWins<T>(): SyncConflictResolver<T> {
	return {
		resolve(_local: T, remote: T): T {
			return remote;
		},
	};
}

/**
 * Creates a first-write-wins conflict resolver
 * @returns Conflict resolver
 */
export function firstWriteWins<T>(): SyncConflictResolver<T> {
	return {
		resolve(local: T, _remote: T): T {
			return local;
		},
	};
}

/**
 * Creates a merge conflict resolver
 * @param mergeFn Merge function
 * @returns Conflict resolver
 */
export function mergeConflictResolver<T>(mergeFn: (local: T, remote: T) => T): SyncConflictResolver<T> {
	return {
		resolve(local: T, remote: T): T {
			return mergeFn(local, remote);
		},
	};
}
