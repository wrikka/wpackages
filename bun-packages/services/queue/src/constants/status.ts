/**
 * Queue status and priority constants
 */

/** Queue status constants */
export const QUEUE_STATUS = {
	IDLE: "idle",
	PROCESSING: "processing",
	PAUSED: "paused",
	STOPPED: "stopped",
} as const;

/** Queue priority levels */
export const QUEUE_PRIORITY = {
	LOW: 1,
	NORMAL: 2,
	HIGH: 3,
	URGENT: 4,
} as const;

/** Default retry attempts for failed operations */
export const DEFAULT_RETRY_ATTEMPTS = 3;
