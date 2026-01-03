import type { QueueConfig, QueueError, TaskQueue } from "@wpackages/queue";

/**
 * Result type - simple discriminated union
 */
export type Result<E, A> =
	| { readonly _tag: "Failure"; readonly error: E }
	| { readonly _tag: "Success"; readonly value: A };

/**
 * Task priority levels
 */
export type TaskPriority = "low" | "normal" | "high" | "critical";

/**
 * Base task definition
 */
export interface Task<T_IN = unknown, T_OUT = unknown, E = Error> {
	readonly id: string;
	readonly name: string;
	readonly execute: (input: T_IN) => Promise<Result<E, T_OUT>>;
	readonly priority?: TaskPriority | undefined;
	readonly timeout?: number | undefined;
	readonly retries?: number | undefined;
	readonly metadata?: Record<string, unknown> | undefined;
}

/**
 * Task result definition
 */
export interface TaskResult<T_OUT = unknown, E = Error> {
    readonly taskId: string;
    readonly status: "completed" | "failed";
    readonly result: Result<E, T_OUT> | undefined;
    readonly startedAt: Date;
    readonly completedAt: Date;
    readonly duration: number; // in milliseconds
    readonly attempts: number;
    readonly error?: E | undefined;
}

// Helper functions for Result type
export function ok<A>(value: A): Result<never, A> {
    return { _tag: "Success", value };
}

export function err<E>(error: E): Result<E, never> {
    return { _tag: "Failure", error };
}

export function isOk<E, A>(result: Result<E, A>): result is { readonly _tag: "Success"; readonly value: A } {
    return result._tag === "Success";
}

export function isErr<E, A>(result: Result<E, A>): result is { readonly _tag: "Failure"; readonly error: E } {
    return result._tag === "Failure";
}

export type {
    QueueConfig,
    QueueError,
    TaskQueue
};

/**
 * Base task definition
 */
export type WorkflowContext = Map<string, any>;

/**
 * Schedule configuration (cron-like)
 */
export interface Schedule {
	readonly type: "cron" | "interval" | "once" | "daily" | "weekly";
	readonly expression?: string | undefined; // cron expression
	readonly interval?: number | undefined; // milliseconds
	readonly time?: string | undefined; // "HH:MM" for daily
	readonly dayOfWeek?: number | undefined; // 0-6 for weekly
	readonly timezone?: string | undefined;
}

/**
 * Scheduled task
 */
export interface ScheduledTask<T_IN = unknown, T_OUT = unknown, E = Error> extends Task<T_IN, T_OUT, E> {
	readonly schedule: Schedule;
	readonly enabled: boolean;
	readonly nextRun?: Date | undefined;
	readonly lastRun?: Date | undefined;
}


/**
 * Workflow step
 */
export interface WorkflowStep<T_IN = unknown, T_OUT = unknown, E = Error> {
	readonly id: string;
	readonly name: string;
	readonly task: Task<T_IN, T_OUT, E>;
	readonly input?: ((context: WorkflowContext) => T_IN) | undefined;
	readonly dependsOn?: string[] | undefined; // step IDs
	readonly onSuccess?: ((result: T_OUT) => void) | undefined;
	readonly onError?: ((error: E) => void) | undefined;
	readonly rollback?: (() => Promise<void>) | undefined;
}

/**
 * Workflow definition
 */
export interface Workflow<E = Error> {
	readonly id: string;
	readonly name: string;
	readonly steps: WorkflowStep<any, any, E>[];
	readonly parallel?: boolean | undefined; // run independent steps in parallel
	readonly transactional?: boolean | undefined; // rollback on failure
}

/**
 * Transaction context
 */
export interface Transaction {
	readonly id: string;
	readonly steps: Array<{
		readonly execute: () => Promise<void>;
		readonly rollback: () => Promise<void>;
	}>;
	readonly status: "pending" | "committed" | "rolled-back";
}

/**
 * Task error types
 */
export interface TaskError {
	readonly name: "TaskError";
	readonly message: string;
	readonly taskId?: string | undefined;
	readonly taskName?: string | undefined;
	readonly code?: string | undefined;
	readonly metadata?: Record<string, unknown> | undefined;
	readonly cause?: Error | undefined;
}

export interface ScheduleError {
	readonly name: "ScheduleError";
	readonly message: string;
	readonly schedule?: Schedule | undefined;
	readonly code?: string | undefined;
	readonly metadata?: Record<string, unknown> | undefined;
	readonly cause?: Error | undefined;
}


export interface WorkflowError {
	readonly name: "WorkflowError";
	readonly message: string;
	readonly workflowId?: string | undefined;
	readonly stepId?: string | undefined;
	readonly code?: string | undefined;
	readonly metadata?: Record<string, unknown> | undefined;
	readonly cause?: Error | undefined;
}

/**
 * Union of all task errors
 */
export type AnyTaskError = TaskError | ScheduleError | QueueError | WorkflowError;
