import type { ScheduleConfig } from "./schedule";

export type JobStatus =
	| "pending"
	| "running"
	| "completed"
	| "failed"
	| "cancelled"
	| "retrying";

export type JobPriority = "low" | "normal" | "high" | "critical";

export interface RetryConfig {
	readonly maxRetries: number;
	readonly backoffStrategy: "fixed" | "exponential" | "linear";
	readonly initialDelay: number;
	readonly maxDelay: number;
	readonly backoffMultiplier: number;
}

export interface JobDependency {
	readonly jobId: string;
	readonly type: "success" | "completion" | "failure";
}

export interface JobExecution {
	readonly id: string;
	readonly jobId: string;
	readonly startedAt: Date;
	readonly completedAt?: Date;
	readonly status: JobStatus;
	readonly error?: string;
	readonly retryCount: number;
	readonly duration?: number;
}

export interface JobMetrics {
	readonly totalRuns: number;
	readonly successCount: number;
	readonly failureCount: number;
	readonly averageDuration: number;
	readonly lastRunAt?: Date;
	readonly nextRunAt?: Date;
}

export interface Job extends ScheduleConfig {
	readonly id: string;
	readonly cron: string;
	readonly priority: JobPriority;
	readonly status: JobStatus;
	readonly retryConfig?: RetryConfig;
	readonly timeout?: number;
	readonly concurrency?: number;
	readonly dependencies?: JobDependency[];
	readonly data?: Record<string, unknown>;
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly lastRunAt?: Date;
	readonly nextRunAt?: Date;
	readonly runCount: number;
	readonly failureCount: number;
	readonly enabled: boolean;
}

export interface JobFilter {
	readonly status?: JobStatus[];
	readonly priority?: JobPriority[];
	readonly name?: string;
	readonly enabled?: boolean;
	readonly from?: Date;
	readonly to?: Date;
}

export interface JobUpdate {
	readonly enabled?: boolean;
	readonly cron?: string;
	readonly priority?: JobPriority;
	readonly retryConfig?: RetryConfig;
	readonly timeout?: number;
	readonly concurrency?: number;
	readonly data?: Record<string, unknown>;
}
