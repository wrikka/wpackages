import { Effect, Fiber, Option, Ref } from "effect";
import type { JobEventData } from "../../types/event";
import type { Job, JobPriority, RetryConfig } from "../../types/job";
import { DistributedLockManagerTag } from "../distributed";
import { EventBusTag } from "../event";
import { executeJob } from "../job-execution";
import { createJob } from "../job-lifecycle";
import { JobRepositoryTag } from "../persistence";

export const scheduleJob = (
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
		const lockManager = yield* DistributedLockManagerTag;
		const eventBus = yield* EventBusTag;

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

		yield* eventBus.emit({
			type: "job:scheduled",
			jobId: job.id,
			timestamp: new Date(),
			data: { job },
		} as JobEventData);

		return { job, fiber };
	});
