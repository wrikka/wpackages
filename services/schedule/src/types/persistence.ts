import type { Option } from "effect";
import type { Effect } from "effect";
import type { Job, JobExecution, JobFilter, JobMetrics } from "./job";

export type PersistenceAdapter = "memory" | "mongodb" | "postgresql" | "sqlite";

export interface PersistenceConfig {
	readonly adapter: PersistenceAdapter;
	readonly connectionString?: string;
	readonly collection?: string;
	readonly table?: string;
	readonly options?: Record<string, unknown>;
}

export interface JobRepository {
	readonly save: (job: Job) => Effect.Effect<void>;
	readonly findById: (id: string) => Effect.Effect<Option<Job>>;
	readonly findByName: (name: string) => Effect.Effect<Option<Job>>;
	readonly findAll: (filter?: JobFilter) => Effect.Effect<ReadonlyArray<Job>>;
	readonly update: (id: string, update: Partial<Job>) => Effect.Effect<void>;
	readonly delete: (id: string) => Effect.Effect<void>;
	readonly lock: (id: string, ttl: number) => Effect.Effect<boolean>;
	readonly unlock: (id: string) => Effect.Effect<void>;
	readonly findNextJobs: (limit: number) => Effect.Effect<ReadonlyArray<Job>>;
}

export interface ExecutionRepository {
	readonly save: (execution: JobExecution) => Effect.Effect<void>;
	readonly findById: (id: string) => Effect.Effect<Option<JobExecution>>;
	readonly findByJobId: (
		jobId: string,
		limit?: number,
	) => Effect.Effect<ReadonlyArray<JobExecution>>;
	readonly findRecent: (
		limit: number,
	) => Effect.Effect<ReadonlyArray<JobExecution>>;
	readonly deleteOld: (before: Date) => Effect.Effect<number>;
}

export interface MetricsRepository {
	readonly getJobMetrics: (jobId: string) => Effect.Effect<Option<JobMetrics>>;
	readonly getAllMetrics: () => Effect.Effect<
		ReadonlyArray<{ jobId: string; metrics: JobMetrics }>
	>;
	readonly updateMetrics: (
		jobId: string,
		execution: JobExecution,
	) => Effect.Effect<void>;
	readonly resetMetrics: (jobId: string) => Effect.Effect<void>;
}
