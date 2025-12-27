/**
 * services-message
 * Comprehensive messaging service for the WTS framework
 * Built with Effect-TS for type-safe, functional messaging
 */

// ============================================
// Configuration
// ============================================

export { MESSAGE_CONFIG } from "./config";
export type { MessageConfig } from "./config";

// ============================================
// Constants
// ============================================

export {
	MESSAGE_CHANNELS,
	MESSAGE_PRIORITIES,
	MESSAGE_STATUSES,
	MESSAGE_TYPES,
} from "./constant";
export type {
	MessageChannel,
	MessagePriority,
	MessageStatus,
	MessageType,
} from "./constant";

// ============================================
// Types
// ============================================

export * from "./types";

// ============================================
// Components (Pure Functions)
// ============================================

export {
	calculateBackoffDelay,
	calculateBackoffWithJitter,
	calculateLinearBackoff,
	createRetryAttempts,
	getRetryMetadata,
	isRetryableError,
	shouldRetry,
	renderTemplate,
	validateTemplate,
	sanitizeContent,
	validateEmail,
	validatePhoneNumber,
	chunkNotifications,
	deduplicateRecipients,
	groupByChannel,
	groupByPriority,
	mergeNotifications,
	sortByPriority,
	calculateBatchStats,
} from "./components";

// ============================================
// Services
// ============================================

export * from "./services";

// ============================================
// Utils
// ============================================

export { validateAndSanitize } from "./utils";

