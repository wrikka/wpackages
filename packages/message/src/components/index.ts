/**
 * Components barrel export
 * Pure functions for message processing
 */

export {
	calculateBackoffDelay,
	calculateBackoffWithJitter,
	calculateLinearBackoff,
	createRetryAttempts,
	getRetryMetadata,
	isRetryableError,
	shouldRetry,
} from "./retry-strategies.component";
export type { RetryConfig } from "./retry-strategies.component";

export {
	renderTemplate,
	validateTemplate,
} from "./template.component";

export {
	sanitizeContent,
	validateEmail,
	validatePhoneNumber,
} from "./validation.component";

export {
	chunkNotifications,
	deduplicateRecipients,
	groupByChannel,
	groupByPriority,
	mergeNotifications,
	sortByPriority,
	calculateBatchStats,
} from "./batch-processing.component";
