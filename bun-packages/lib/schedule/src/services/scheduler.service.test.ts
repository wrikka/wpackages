import { assert, describe, it } from "@effect/vitest";
import { Effect, Ref } from "effect";
import * as TestClock from "effect/TestClock";
import {
	SchedulerLive,
	SchedulerService,
	TaskAlreadyExists,
	TaskNotFound,
} from "./scheduler.service";

describe("SchedulerService", () => {
	it("should schedule and list a task", () =>
		Effect.gen(function* () {
			const service = yield* SchedulerService;
			const config = { name: "test-task", enabled: true };
			const task = Effect.void;

			yield* service.scheduleTask(config, task);
			const tasks = yield* service.listTasks();

			assert.deepStrictEqual(tasks, ["test-task"]);
		}).pipe(Effect.provide(SchedulerLive)));

	it("should run a scheduled task after an interval", () =>
		Effect.gen(function* () {
			const service = yield* SchedulerService;
			const ref = yield* Ref.make(0);
			const task = Ref.update(ref, (n) => n + 1);
			const config = { name: "increment-task", enabled: true };

			yield* service.scheduleTask(config, task);

			// Advance the clock and check if the task ran
			yield* TestClock.adjust("1 seconds");
			const value = yield* Ref.get(ref);
			assert.strictEqual(value, 1);
		}).pipe(Effect.provide(SchedulerLive)));

	it("should prevent scheduling duplicate tasks", () =>
		Effect.gen(function* () {
			const service = yield* SchedulerService;
			const config = { name: "duplicate-task", enabled: true };
			const task = Effect.void;

			yield* service.scheduleTask(config, task);
			const result = yield* Effect.flip(service.scheduleTask(config, task));

			assert.deepStrictEqual(
				result,
				new TaskAlreadyExists({ name: "duplicate-task" }),
			);
		}).pipe(Effect.provide(SchedulerLive)));

	it("should cancel a task", () =>
		Effect.gen(function* () {
			const service = yield* SchedulerService;
			const config = { name: "cancel-task", enabled: true };
			const task = Effect.void;

			yield* service.scheduleTask(config, task);
			yield* service.cancelTask("cancel-task");
			const tasks = yield* service.listTasks();

			assert.deepStrictEqual(tasks, []);
		}).pipe(Effect.provide(SchedulerLive)));

	it("should fail to cancel a non-existent task", () =>
		Effect.gen(function* () {
			const service = yield* SchedulerService;
			const result = yield* Effect.flip(
				service.cancelTask("non-existent-task"),
			);

			assert.deepStrictEqual(
				result,
				new TaskNotFound({ name: "non-existent-task" }),
			);
		}).pipe(Effect.provide(SchedulerLive)));
});
