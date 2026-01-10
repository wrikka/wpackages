import { Effect } from "effect";
import type { JobEventData } from "../../types/event";
import type { Job, JobExecution } from "../../types/job";
import { calculateBackoffDelay, withRetry } from "../../utils/retry";
import { SchedulerError } from "../enhanced-scheduler.service";
import { EventBusTag } from "../event";
import {
	ExecutionRepositoryTag,
	JobRepositoryTag,
	MetricsRepositoryTag,
} from "../persistence";

export const executeJob = (
	job: Job,
	task: Effect.Effect<void>,
): Effect.Effect<void> =>
	Effect.gen(function* () {
		const executionRepo = yield* ExecutionRepositoryTag;
		const jobRepo = yield* JobRepositoryTag;
		const metricsRepo = yield* MetricsRepositoryTag;
		const eventBus = yield* EventBusTag;

		const executionId = crypto.randomUUID();
		const startedAt = new Date();

		const execution: JobExecution = {
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

		if (Effect.isEitherSuccess(result)) {
			execution.status = "completed";
			execution.completedAt = completedAt;
			execution.duration = duration;

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
				execution.retryCount++;
				execution.status = "retrying";

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
				execution.status = "failed";
				execution.completedAt = completedAt;
				execution.duration = duration;
				execution.error =
					error instanceof Error ? error.message : String(error);

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

const calculateNextRun = (cron: string, from: Date = new Date()): Date => {
	const { parseCronExpression } = require("../../utils/cron-parser");
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
