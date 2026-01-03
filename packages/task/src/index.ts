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
	Result,
	Schedule,
	ScheduledTask,
	ScheduleError,
	Task,
	TaskError,
	TaskPriority,
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

export { ok, err, createTask, workflowError } from "@w/workflow";
export { scheduleError, taskError } from "./utils/creators";
export { parseSchedule, shouldRun, updateNextRun } from "./utils/scheduler";
export {
	withTaskBulkhead,
	withTaskCircuitBreaker,
	withTaskRateLimit,
	withTaskRetry,
	withTaskTimeout,
} from "./utils/resilience";

// ============================================
// Workflow
// ============================================

export { createWorkflow, executeWorkflow, validateWorkflow } from "@w/workflow";

// ============================================
// Transaction
// ============================================

export { createTransaction, executeTransaction, rollbackTransaction } from "./services/transaction.service";

export type { QueueWorker } from "./services/worker.service";

// ============================================
// Log
// ============================================

export { log } from "./services/log.service";
