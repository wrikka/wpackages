import type { Result, Schedule } from "../types";
import type { ScheduleError, Task, TaskError, TaskPriority, WorkflowError } from "../types";

/**
 * Create a task
 */
export function createTask<T_IN = unknown, T_OUT = unknown, E = Error>(
	name: string,
	execute: (input: T_IN) => Promise<Result<E, T_OUT>>,
	options?: {
		id?: string;
		priority?: TaskPriority;
		timeout?: number;
		retries?: number;
		metadata?: Record<string, unknown>;
	},
): Task<T_IN, T_OUT, E> {
	return {
		id: options?.id ?? crypto.randomUUID(),
		name,
		execute,
		priority: options?.priority ?? "normal",
		timeout: options?.timeout,
		retries: options?.retries ?? 0,
		metadata: options?.metadata,
	};
}

/**
 * Create task error
 */
export function taskError(
	message: string,
	options?: {
		taskId?: string;
		taskName?: string;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): TaskError {
	return {
		name: "TaskError",
		message,
		taskId: options?.taskId,
		taskName: options?.taskName,
		code: options?.code,
		metadata: options?.metadata,
		cause: options?.cause,
	};
}

/**
 * Create schedule error
 */
export function scheduleError(
	message: string,
	options?: {
		schedule?: Schedule;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): ScheduleError {
	return {
		name: "ScheduleError",
		message,
		schedule: options?.schedule,
		code: options?.code,
		metadata: options?.metadata,
		cause: options?.cause,
	};
}

/**
 * Create workflow error
 */
export function workflowError(
	message: string,
	options?: {
		workflowId?: string;
		stepId?: string;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): WorkflowError {
	return {
		name: "WorkflowError",
		message,
		workflowId: options?.workflowId,
		stepId: options?.stepId,
		code: options?.code,
		metadata: options?.metadata,
		cause: options?.cause,
	};
}
