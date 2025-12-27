/**
 * Default configuration values for tasks and queues
 */

export const TASK_DEFAULTS = {
	priority: "normal" as const,
	retries: 0,
	timeout: undefined,
} as const;

export const QUEUE_DEFAULTS = {
	maxConcurrent: 5,
	maxRetries: 3,
	retryDelay: 1000,
	timeout: 30000,
	priority: false,
} as const;

export const SCHEDULE_DEFAULTS = {
	timezone: "UTC",
} as const;

export const WORKFLOW_DEFAULTS = {
	parallel: false,
	transactional: false,
} as const;

export const TRANSACTION_DEFAULTS = {
	status: "pending" as const,
} as const;
