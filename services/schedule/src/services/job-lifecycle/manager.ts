import { Effect, Option } from "effect";
import type { Job, JobPriority, RetryConfig } from "../../types/job";
import { parseCronExpression } from "../../utils/cron-parser";
import {
	JobAlreadyExistsError,
	JobNotFoundError,
	SchedulerError,
} from "../enhanced-scheduler.service";
import {
	ExecutionRepositoryTag,
	JobRepositoryTag,
	MetricsRepositoryTag,
} from "../persistence";

const calculateNextRun = (cron: string, from: Date = new Date()): Date => {
	const interval = parseCronExpression(cron);
	if (Effect.isEffectFailure(interval)) {
		return from;
	}
	const result = Effect.runSync(interval);
	const next = new Date(from);
	next.setSeconds(result.seconds);
	next.setMinutes(result.minutes);
	next.setHours(result.hours);
	next.setDate(result.days);
	if (next <= from) {
		next.setDate(next.getDate() + 1);
	}
	return next;
};

export const createJob = (
	name: string,
	cron: string,
	task: Effect.Effect<void>,
	options?: {
		priority?: JobPriority;
		retryConfig?: RetryConfig;
		timeout?: number;
		concurrency?: number;
		data?: Record<string, unknown>;
	},
) =>
	Effect.gen(function* () {
		const jobRepo = yield* JobRepositoryTag;

		const existing = yield* jobRepo.findByName(name);
		if (Option.isSome(existing)) {
			return yield* new JobAlreadyExistsError({ jobName: name });
		}

		const job: Job = {
			id: crypto.randomUUID(),
			name,
			cron,
			description: options?.data?.description as string | undefined,
			enabled: true,
			timezone: "UTC",
			priority: options?.priority ?? "normal",
			status: "pending",
			retryConfig: options?.retryConfig,
			timeout: options?.timeout,
			concurrency: options?.concurrency,
			data: options?.data,
			createdAt: new Date(),
			updatedAt: new Date(),
			nextRunAt: calculateNextRun(cron),
			runCount: 0,
			failureCount: 0,
		};

		yield* jobRepo.save(job);
		return job;
	});

export const updateJob = (jobId: string, updates: Partial<Job>) =>
	Effect.gen(function* () {
		const jobRepo = yield* JobRepositoryTag;

		const existing = yield* jobRepo.findById(jobId);
		if (Option.isNone(existing)) {
			return yield* new JobNotFoundError({ jobId });
		}

		const job = existing.value;
		const updated = { ...job, ...updates, updatedAt: new Date() };

		if (updates.cron && updates.cron !== job.cron) {
			updated.nextRunAt = calculateNextRun(updates.cron);
		}

		yield* jobRepo.update(jobId, updated);
		return updated;
	});

export const cancelJob = (jobId: string) =>
	Effect.gen(function* () {
		const jobRepo = yield* JobRepositoryTag;

		yield* jobRepo.update(jobId, { enabled: false, status: "cancelled" });
	});

export const listJobs = () => {
	const jobRepo = JobRepositoryTag;
	return Effect.flatMap(jobRepo, (repo) => repo.findAll());
};

export const getJob = (jobId: string) => {
	const jobRepo = JobRepositoryTag;
	return Effect.flatMap(jobRepo, (repo) => repo.findById(jobId));
};

export const getJobExecutions = (jobId: string, limit = 100) => {
	const executionRepo = ExecutionRepositoryTag;
	return Effect.flatMap(executionRepo, (repo) =>
		repo.findByJobId(jobId, limit),
	);
};

export const getJobMetrics = (jobId: string) => {
	const metricsRepo = MetricsRepositoryTag;
	return Effect.flatMap(metricsRepo, (repo) => repo.getJobMetrics(jobId));
};
