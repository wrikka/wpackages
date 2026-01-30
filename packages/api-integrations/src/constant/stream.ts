/**
 * Streaming constants
 */

/**
 * Default reconnect delay (ms)
 */
export const DEFAULT_RECONNECT_DELAY = 1000;

/**
 * Maximum reconnect attempts
 */
export const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Default heartbeat interval (ms)
 */
export const DEFAULT_HEARTBEAT_INTERVAL = 30_000;

/**
 * Stream states
 */
export const STREAM_STATES = {
	CLOSED: "closed",
	CONNECTING: "connecting",
	ERROR: "error",
	OPEN: "open",
} as const;

/**
 * Common SSE event types
 */
export const SSE_EVENT_TYPES = {
	CLOSE: "close",
	ERROR: "error",
	MESSAGE: "message",
	OPEN: "open",
} as const;

/**
 * WebSocket close codes
 */
export const WS_CLOSE_CODES = {
	GOING_AWAY: 1001,
	INTERNAL_ERROR: 1011,
	INVALID_DATA: 1007,
	MESSAGE_TOO_BIG: 1009,
	NORMAL: 1000,
	POLICY_VIOLATION: 1008,
	PROTOCOL_ERROR: 1002,
	UNSUPPORTED_DATA: 1003,
} as const;
