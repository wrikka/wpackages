/**
 * Queue Configuration
 * Configuration options for queue behavior
 */

/** Queue configuration options */
export interface QueueConfig {
	/** Default capacity for bounded queues */
	defaultCapacity: number;
	/** Whether to enable debug logging */
	debug: boolean;
	/** Timeout for dequeue operations in milliseconds */
	dequeueTimeoutMs: number;
	/** Whether to throw on offer failure */
	throwOnOfferFailure: boolean;
}

/** Default queue configuration */
export const defaultQueueConfig: QueueConfig = {
	defaultCapacity: 100,
	debug: false,
	dequeueTimeoutMs: 5000,
	throwOnOfferFailure: false,
};

/** Current queue configuration */
let currentConfig: QueueConfig = { ...defaultQueueConfig };

/** Get current queue configuration */
export function getQueueConfig(): QueueConfig {
	return { ...currentConfig };
}

/** Set queue configuration */
export function setQueueConfig(config: Partial<QueueConfig>): void {
	currentConfig = { ...currentConfig, ...config };
}

/** Reset queue configuration to defaults */
export function resetQueueConfig(): void {
	currentConfig = { ...defaultQueueConfig };
}
