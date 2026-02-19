import type { Effect } from "effect";
import type { Job, JobExecution } from "./job";

export type EventType =
	| "job:scheduled"
	| "job:started"
	| "job:completed"
	| "job:failed"
	| "job:retrying"
	| "job:cancelled"
	| "job:timeout"
	| "scheduler:started"
	| "scheduler:stopped"
	| "scheduler:error";

export interface JobEvent {
	readonly type: EventType;
	readonly jobId: string;
	readonly timestamp: Date;
	readonly data?: Record<string, unknown>;
}

export interface JobScheduledEvent extends JobEvent {
	readonly type: "job:scheduled";
	readonly data: {
		readonly job: Job;
	};
}

export interface JobStartedEvent extends JobEvent {
	readonly type: "job:started";
	readonly data: {
		readonly execution: JobExecution;
	};
}

export interface JobCompletedEvent extends JobEvent {
	readonly type: "job:completed";
	readonly data: {
		readonly execution: JobExecution;
		readonly duration: number;
	};
}

export interface JobFailedEvent extends JobEvent {
	readonly type: "job:failed";
	readonly data: {
		readonly execution: JobExecution;
		readonly error: Error;
		readonly willRetry: boolean;
	};
}

export interface JobRetryingEvent extends JobEvent {
	readonly type: "job:retrying";
	readonly data: {
		readonly execution: JobExecution;
		readonly error: Error;
		readonly retryCount: number;
		readonly nextRetryAt: Date;
	};
}

export interface JobCancelledEvent extends JobEvent {
	readonly type: "job:cancelled";
	readonly data: {
		readonly execution: JobExecution;
	};
}

export interface JobTimeoutEvent extends JobEvent {
	readonly type: "job:timeout";
	readonly data: {
		readonly execution: JobExecution;
		readonly timeout: number;
	};
}

export interface SchedulerStartedEvent extends JobEvent {
	readonly type: "scheduler:started";
}

export interface SchedulerStoppedEvent extends JobEvent {
	readonly type: "scheduler:stopped";
}

export interface SchedulerErrorEvent extends JobEvent {
	readonly type: "scheduler:error";
	readonly data: {
		readonly error: Error;
	};
}

export type JobEventData =
	| JobScheduledEvent
	| JobStartedEvent
	| JobCompletedEvent
	| JobFailedEvent
	| JobRetryingEvent
	| JobCancelledEvent
	| JobTimeoutEvent
	| SchedulerStartedEvent
	| SchedulerStoppedEvent
	| SchedulerErrorEvent;

export type EventHandler = (event: JobEventData) => Effect.Effect<void>;
