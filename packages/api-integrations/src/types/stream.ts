import type { IntegrationError } from "./integration";

type ResultType<T, E> =
	| { success: true; value: T }
	| { success: false; error: E };

/**
 * Stream configuration
 */
export type StreamConfig = {
	readonly url: string;
	readonly headers?: Record<string, string>;
	readonly reconnect?: boolean;
	readonly reconnectDelay?: number;
	readonly maxReconnectAttempts?: number;
};

/**
 * Server-Sent Events (SSE) configuration
 */
export type SSEConfig = StreamConfig & {
	readonly eventTypes?: readonly string[];
	readonly withCredentials?: boolean;
};

/**
 * WebSocket configuration
 */
export type WebSocketConfig = StreamConfig & {
	readonly protocols?: readonly string[];
	readonly heartbeatInterval?: number;
};

/**
 * Stream event
 */
export type StreamEvent<T = unknown> = {
	readonly id?: string;
	readonly type: string;
	readonly data: T;
	readonly timestamp: number;
	readonly retry?: number;
};

/**
 * Stream state
 */
export type StreamState = "connecting" | "open" | "closed" | "error";

/**
 * Stream handler
 */
export type StreamHandler<T = unknown> = {
	readonly onMessage: (event: StreamEvent<T>) => void | Promise<void>;
	readonly onError?: (error: IntegrationError) => void | Promise<void>;
	readonly onOpen?: () => void | Promise<void>;
	readonly onClose?: () => void | Promise<void>;
};

/**
 * Stream connection
 */
export type StreamConnection<T = unknown> = {
	readonly connect: () => Promise<ResultType<void, IntegrationError>>;
	readonly disconnect: () => Promise<void>;
	readonly send: (data: T) => Promise<ResultType<void, IntegrationError>>;
	readonly state: () => StreamState;
	readonly isConnected: () => boolean;
};

/**
 * SSE parser result
 */
export type SSEParseResult = {
	readonly id?: string;
	readonly event?: string;
	readonly data: string;
	readonly retry?: number;
};

/**
 * Stream metrics
 */
export type StreamMetrics = {
	readonly messagesReceived: number;
	readonly messagesSent: number;
	readonly errors: number;
	readonly reconnections: number;
	readonly uptime: number;
	readonly averageLatency: number;
};
