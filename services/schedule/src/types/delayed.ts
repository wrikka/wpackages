import { Option } from "effect";
import type { Effect } from "effect";
import type { Job } from "./job";

export type DelayedJobStatus =
	| "scheduled"
	| "executing"
	| "completed"
	| "failed"
	| "cancelled";

export interface DelayedJob {
	readonly id: string;
	readonly jobId?: string;
	readonly task: Effect.Effect<void>;
	readonly executeAt: Date;
	readonly status: DelayedJobStatus;
	readonly createdAt: Date;
	readonly startedAt?: Date;
	readonly completedAt?: Date;
	readonly error?: string;
	readonly retryCount: number;
	readonly maxRetries?: number;
}
