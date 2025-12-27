/**
 * task - Task Orchestration and Scheduling
 *
 * Workflow orchestration, task scheduling, queues, and parallel execution
 *
 * @example
 * ```ts
 * import { createTask, createQueue, enqueue } from 'task';
 * import { ok } from 'functional';
 *
 * const task = createTask('fetch-data', async () => {
 *   const data = await fetchData();
 *   return ok(data);
 * });
 *
 * const queue = createQueue('main', { maxConcurrent: 5 });
 * enqueue(queue, task);
 * ```
 *
 * @module task
 */

// ============================================
// Types
// ============================================

export type {
	AnyTaskError,
	QueueConfig,
	QueueError,
	Result,
	Schedule,
	ScheduledTask,
	ScheduleError,
	Task,
	TaskError,
	TaskPriority,
	TaskQueue,
	TaskResult,
	TaskStatus,
	Transaction,
	Workflow,
	WorkflowContext,
	WorkflowError,
	WorkflowStep,
} from "./types";

// ============================================
// Constants
// ============================================

export {
	QUEUE_DEFAULTS,
	SCHEDULE_DEFAULTS,
	TASK_DEFAULTS,
	TRANSACTION_DEFAULTS,
	WORKFLOW_DEFAULTS,
} from "./constant";

// ============================================
// Components (Pure Functions)
// ============================================

export { isValidPriority, isValidSchedule, isValidTask, isValidWorkflow } from "./components";

// ============================================
// Utilities
// ============================================

export { ok, err } from "./utils/result";
export { createTask, queueError, scheduleError, taskError, workflowError } from "./utils/creators";
export { parseSchedule, shouldRun, updateNextRun } from "./utils/scheduler";
export {
	withTaskBulkhead,
	withTaskCircuitBreaker,
	withTaskRateLimit,
	withTaskRetry,
	withTaskTimeout,
} from "./utils/resilience";

// ============================================
// Queue
// ============================================

export { clearCompleted, clearFailed, createQueue, enqueue, getQueueStats, processNext } from "./services/queue";

// ============================================
// Workflow
// ============================================

export { createWorkflow, executeWorkflow, validateWorkflow } from "./services/workflow";

// ============================================
// Transaction
// ============================================

export { createTransaction, executeTransaction, rollbackTransaction } from "./services/transaction";

// ============================================
// Worker
// ============================================

export { createQueueWorker } from "./services/worker";
export type { QueueWorker } from "./services/worker";
