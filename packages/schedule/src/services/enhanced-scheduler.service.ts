import {
	Context,
	Data,
	Effect,
	Either,
	Fiber,
	Layer,
	Option,
	Ref,
} from "effect";
import type { JobEventData } from "../types/event";
import type { Job, JobExecution, JobPriority, RetryConfig } from "../types/job";
import { parseCronExpression } from "../utils/cron-parser";
import { calculateBackoffDelay, withRetry } from "../utils/retry";
import { DistributedLockManagerTag } from "./distributed";
import { EventBusTag } from "./event";
import {
	ExecutionRepositoryTag,
	JobRepositoryTag,
	MetricsRepositoryTag,
} from "./persistence";

export class SchedulerError extends Data.TaggedError("SchedulerError")<{
	reason: string;
}> {}

export class JobNotFoundError extends Data.TaggedError("JobNotFoundError")<{
	jobId: string;
}> {}

export class JobAlreadyExistsError extends Data.TaggedError(
	"JobAlreadyExistsError",
)<{
	jobName: string;
}> {}

export interface EnhancedScheduler {
	readonly scheduleJob: (
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
	) => Effect.Effect<Job, unknown, unknown>;
	readonly cancelJob: (jobId: string) => Effect.Effect<void, unknown, unknown>;
	readonly updateJob: (
		jobId: string,
		updates: Partial<Job>,
	) => Effect.Effect<Job, unknown, unknown>;
	readonly listJobs: () => Effect.Effect<readonly Job[], unknown, unknown>;
	readonly getJob: (
		jobId: string,
	) => Effect.Effect<Option.Option<Job>, unknown, unknown>;
	readonly getJobExecutions: (
		jobId: string,
		limit?: number,
	) => Effect.Effect<readonly JobExecution[], unknown, unknown>;
	readonly getJobMetrics: (
		jobId: string,
	) => Effect.Effect<Option.Option<unknown>, unknown, unknown>;
	readonly start: () => Effect.Effect<void, unknown, unknown>;
	readonly stop: () => Effect.Effect<void, unknown, unknown>;
}

const calculateNextRun = (cron: string, from: Date = new Date()): Date => {
	const interval = Effect.runSync(Effect.either(parseCronExpression(cron)));
	if (Either.isLeft(interval)) return from;
	const result = interval.right;
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

const makeEnhancedScheduler = Effect.gen(function* () {
	const jobRepo = yield* JobRepositoryTag;
	const executionRepo = yield* ExecutionRepositoryTag;
	const metricsRepo = yield* MetricsRepositoryTag;
	const lockManager = yield* DistributedLockManagerTag;
	const eventBus = yield* EventBusTag;

	const runningJobs = yield* Ref.make(
		new Map<string, Fiber.RuntimeFiber<unknown, unknown>>(),
	);

	const createJob = (
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
			const existing = yield* jobRepo.findByName(name);
			if (Option.isSome(existing)) {
				return yield* new JobAlreadyExistsError({ jobName: name });
			}

			const description = (
				options?.data as { description?: string } | undefined
			)?.description;

			const job: Job = {
				id: crypto.randomUUID(),
				name,
				cron,
				...(description ? { description } : {}),
				enabled: true,
				timezone: "UTC",
				priority: options?.priority ?? "normal",
				status: "pending",
				...(options?.retryConfig ? { retryConfig: options.retryConfig } : {}),
				...(typeof options?.timeout === "number"
					? { timeout: options.timeout }
					: {}),
				...(typeof options?.concurrency === "number"
					? { concurrency: options.concurrency }
					: {}),
				...(options?.data ? { data: options.data } : {}),
				createdAt: new Date(),
				updatedAt: new Date(),
				nextRunAt: calculateNextRun(cron),
				runCount: 0,
				failureCount: 0,
			};

			yield* jobRepo.save(job);
			return job;
		});

	const executeJob = (job: Job, task: Effect.Effect<void>) =>
		Effect.gen(function* () {
			const executionId = crypto.randomUUID();
			const startedAt = new Date();

			let execution: JobExecution = {
				id: executionId,
				jobId: job.id,
				startedAt,
				status: "running",
				retryCount: 0,
			};

			yield* executionRepo.save(execution);
			yield* jobRepo.update(job.id, {
				status: "running",
				lastRunAt: startedAt,
			});

			const taskWithTimeout = job.timeout
				? Effect.timeout(task, job.timeout).pipe(
						Effect.catchTag("TimeoutException", () =>
							Effect.fail(
								new SchedulerError({
									reason: `Job timeout after ${job.timeout}ms`,
								}),
							),
						),
					)
				: task;

			const taskWithRetry = job.retryConfig
				? withRetry(taskWithTimeout, job.retryConfig)
				: taskWithTimeout;

			const result = yield* Effect.either(taskWithRetry);
			const completedAt = new Date();
			const duration = completedAt.getTime() - startedAt.getTime();

			if (Either.isRight(result)) {
				execution = {
					...execution,
					status: "completed",
					completedAt,
					duration,
				};

				yield* executionRepo.save(execution);
				yield* jobRepo.update(job.id, {
					status: "pending",
					runCount: job.runCount + 1,
					nextRunAt: calculateNextRun(job.cron, completedAt),
				});
				yield* metricsRepo.updateMetrics(job.id, execution);

				yield* eventBus.emit({
					type: "job:completed",
					jobId: job.id,
					timestamp: completedAt,
					data: { execution, duration },
				} as JobEventData);
			} else {
				const error = result.left;
				const shouldRetryJob =
					job.retryConfig && execution.retryCount < job.retryConfig.maxRetries;

				if (shouldRetryJob) {
					execution = {
						...execution,
						retryCount: execution.retryCount + 1,
						status: "retrying",
					};

					const nextRetryDelay = calculateBackoffDelay(
						job.retryConfig,
						execution.retryCount,
					);
					const nextRetryAt = new Date(completedAt.getTime() + nextRetryDelay);

					yield* executionRepo.save(execution);
					yield* jobRepo.update(job.id, {
						status: "retrying",
						failureCount: job.failureCount + 1,
						nextRunAt: nextRetryAt,
					});

					yield* eventBus.emit({
						type: "job:retrying",
						jobId: job.id,
						timestamp: completedAt,
						data: {
							execution,
							error: error as Error,
							retryCount: execution.retryCount,
							nextRetryAt,
						},
					} as JobEventData);

					yield* Effect.sleep(nextRetryDelay);
					yield* executeJob(job, task);
				} else {
					execution = {
						...execution,
						status: "failed",
						completedAt,
						duration,
						error: error instanceof Error ? error.message : String(error),
					};

					yield* executionRepo.save(execution);
					yield* jobRepo.update(job.id, {
						status: "failed",
						failureCount: job.failureCount + 1,
						nextRunAt: calculateNextRun(job.cron, completedAt),
					});
					yield* metricsRepo.updateMetrics(job.id, execution);

					yield* eventBus.emit({
						type: "job:failed",
						jobId: job.id,
						timestamp: completedAt,
						data: {
							execution,
							error: error as Error,
							willRetry: false,
						},
					} as JobEventData);
				}
			}
		});

	const scheduleJob = (
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
			const job = yield* createJob(name, cron, task, options);

			const runJob = Effect.gen(function* () {
				while (true) {
					const currentJob = yield* jobRepo.findById(job.id);
					if (Option.isNone(currentJob) || !currentJob.value.enabled) {
						break;
					}

					const now = new Date();
					if (currentJob.value.nextRunAt && currentJob.value.nextRunAt <= now) {
						const locked = yield* lockManager.acquire(job.id, { ttl: 60000 });
						if (locked) {
							yield* executeJob(currentJob.value, task);
							yield* lockManager.release(locked.id);
						}
					}

					yield* Effect.sleep("1 seconds");
				}
			});

			const fiber = yield* Effect.fork(runJob);

			yield* Ref.update(runningJobs, (map) => {
				map.set(job.id, fiber);
				return map;
			});

			yield* eventBus.emit({
				type: "job:scheduled",
				jobId: job.id,
				timestamp: new Date(),
				data: { job },
			} as JobEventData);

			return job;
		});

	const cancelJob = (jobId: string) =>
		Effect.gen(function* () {
			const jobMap = yield* Ref.get(runningJobs);
			const fiber = jobMap.get(jobId);

			if (fiber) {
				yield* Fiber.interrupt(fiber);
				yield* Ref.update(runningJobs, (map) => {
					map.delete(jobId);
					return map;
				});
			}

			yield* jobRepo.update(jobId, { enabled: false, status: "cancelled" });

			yield* eventBus.emit({
				type: "job:cancelled",
				jobId,
				timestamp: new Date(),
			} as JobEventData);
		});

	const updateJob = (jobId: string, updates: Partial<Job>) =>
		Effect.gen(function* () {
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

	const listJobs = () => jobRepo.findAll();

	const getJob = (jobId: string) => jobRepo.findById(jobId);

	const getJobExecutions = (jobId: string, limit = 100) =>
		executionRepo.findByJobId(jobId, limit);

	const getJobMetrics = (jobId: string) => metricsRepo.getJobMetrics(jobId);

	const start = () =>
		Effect.gen(function* () {
			yield* eventBus.emit({
				type: "scheduler:started",
				jobId: "scheduler",
				timestamp: new Date(),
			} as JobEventData);
		});

	const stop = () =>
		Effect.gen(function* () {
			const jobMap = yield* Ref.get(runningJobs);
			yield* Effect.forEach(
				Array.from(jobMap.values()),
				(fiber) => Fiber.interrupt(fiber),
				{
					concurrency: "unbounded",
				},
			);
			yield* Ref.set(runningJobs, new Map());

			yield* eventBus.emit({
				type: "scheduler:stopped",
				jobId: "scheduler",
				timestamp: new Date(),
			} as JobEventData);
		});

	return {
		scheduleJob,
		cancelJob,
		updateJob,
		listJobs,
		getJob,
		getJobExecutions,
		getJobMetrics,
		start,
		stop,
	};
});

export class EnhancedSchedulerTag extends Context.Tag(
	"@wpackages/EnhancedScheduler",
)<EnhancedSchedulerTag, EnhancedScheduler>() {}

export const EnhancedSchedulerLive = Layer.effect(
	EnhancedSchedulerTag,
	makeEnhancedScheduler,
);
