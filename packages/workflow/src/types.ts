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
export type WorkflowContext = Map<string, any>;

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

export interface WorkflowError {
	readonly name: "WorkflowError";
	readonly message: string;
	readonly workflowId?: string | undefined;
	readonly stepId?: string | undefined;
	readonly code?: string | undefined;
	readonly metadata?: Record<string, unknown> | undefined;
	readonly cause?: Error | undefined;
}
