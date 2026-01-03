import { Context, Data, Effect, Fiber, Layer, Ref } from "effect";
import type { ScheduleConfig } from "../types/index";

// Define custom error types for the scheduler service
export class TaskAlreadyExists extends Data.TaggedError("TaskAlreadyExists")<{
	name: string;
}> {}
export class TaskNotFound extends Data.TaggedError("TaskNotFound")<{
	name: string;
}> {}

// Define the state for a single scheduled task
interface ScheduledTask {
	readonly config: ScheduleConfig;
	readonly fiber: Fiber.RuntimeFiber<never, void>;
}

// Define the Scheduler service interface using Context.Tag
export class SchedulerService extends Context.Tag(
	"@wpackages/SchedulerService",
)<
	SchedulerService,
	{
		readonly scheduleTask: (
			config: ScheduleConfig,
			task: Effect.Effect<void>,
		) => Effect.Effect<void, TaskAlreadyExists>;
		readonly cancelTask: (name: string) => Effect.Effect<void, TaskNotFound>;
		readonly listTasks: () => Effect.Effect<string[]>;
	}
>() {}

// Create a live implementation layer for the SchedulerService
export const SchedulerLive = Layer.effect(
	SchedulerService,
	Effect.gen(function* () {
		// Use Ref to manage the state of tasks in a functional way
		const tasks = yield* Ref.make(new Map<string, ScheduledTask>());

		const scheduleTask = (config: ScheduleConfig, task: Effect.Effect<void>) =>
			Effect.gen(function* () {
				const taskMap = yield* Ref.get(tasks);
				if (config.name && taskMap.has(config.name)) {
					return yield* new TaskAlreadyExists({ name: config.name });
				}

				// In a real implementation, parse cron and use Effect's scheduling capabilities
				const scheduledFiber = yield* Effect.fork(
					Effect.forever(Effect.delay(task, "1 seconds")),
				);

				if (config.name) {
					yield* Ref.update(tasks, (map) =>
						map.set(config.name, { config, fiber: scheduledFiber }),
					);
				}
			});

		const cancelTask = (name: string) =>
			Effect.gen(function* () {
				const taskMap = yield* Ref.get(tasks);
				const task = taskMap.get(name);
				if (!task) {
					return yield* new TaskNotFound({ name });
				}

				yield* Fiber.interrupt(task.fiber);
				yield* Ref.update(tasks, (map) => {
					map.delete(name);
					return map;
				});
			});

		const listTasks = () =>
			Effect.gen(function* () {
				const taskMap = yield* Ref.get(tasks);
				return Array.from(taskMap.keys());
			});

		return { scheduleTask, cancelTask, listTasks };
	}),
);
