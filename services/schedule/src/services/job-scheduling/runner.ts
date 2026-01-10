import { Effect, Fiber, Ref } from "effect";
import type { JobEventData } from "../../types/event";
import { EventBusTag } from "../event";
import { cancelJob } from "../job-lifecycle";

export const makeJobRunner = Effect.gen(function* () {
	const eventBus = yield* EventBusTag;

	const runningJobs = yield* Ref.make(
		new Map<string, Fiber.RuntimeFiber<never, void>>(),
	);

	const addRunningJob = (
		jobId: string,
		fiber: Fiber.RuntimeFiber<never, void>,
	) =>
		Ref.update(runningJobs, (map) => {
			map.set(jobId, fiber);
			return map;
		});

	const removeRunningJob = (jobId: string) =>
		Ref.update(runningJobs, (map) => {
			map.delete(jobId);
			return map;
		});

	const cancelRunningJob = (jobId: string) =>
		Effect.gen(function* () {
			const jobMap = yield* Ref.get(runningJobs);
			const fiber = jobMap.get(jobId);

			if (fiber) {
				yield* Fiber.interrupt(fiber);
				yield* removeRunningJob(jobId);
			}

			yield* cancelJob(jobId);

			yield* eventBus.emit({
				type: "job:cancelled",
				jobId,
				timestamp: new Date(),
			} as JobEventData);
		});

	const startScheduler = () =>
		Effect.gen(function* () {
			yield* eventBus.emit({
				type: "scheduler:started",
				jobId: "scheduler",
				timestamp: new Date(),
			} as JobEventData);
		});

	const stopScheduler = () =>
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
		addRunningJob,
		removeRunningJob,
		cancelRunningJob,
		startScheduler,
		stopScheduler,
	};
});
