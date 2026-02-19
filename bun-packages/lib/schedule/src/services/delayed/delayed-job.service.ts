import { Context, Data, Effect, Fiber, Layer, Ref } from "effect";
import type { DelayedJob, DelayedJobStatus } from "../../types/delayed";

export class DelayedJobError extends Data.TaggedError("DelayedJobError")<{
	reason: string;
}> {}

export class DelayedJobNotFoundError extends Data.TaggedError(
	"DelayedJobNotFoundError",
)<{
	id: string;
}> {}

const makeDelayedJobService = Effect.gen(function* () {
	const jobs = yield* Ref.make(new Map<string, DelayedJob>());
	const fibers = yield* Ref.make(
		new Map<string, Fiber.RuntimeFiber<never, void>>(),
	);

	const schedule = (
		task: Effect.Effect<void>,
		executeAt: Date,
		options?: {
			maxRetries?: number;
			jobId?: string;
		},
	) =>
		Effect.gen(function* () {
			const id = crypto.randomUUID();
			const now = new Date();

			const delayedJob: DelayedJob = {
				id,
				jobId: options?.jobId,
				task,
				executeAt,
				status: "scheduled",
				createdAt: now,
				retryCount: 0,
				maxRetries: options?.maxRetries,
			};

			yield* Ref.update(jobs, (map) => {
				map.set(id, delayedJob);
				return map;
			});

			const delay = executeAt.getTime() - now.getTime();
			if (delay > 0) {
				yield* Effect.sleep(delay);
			}

			const fiber = yield* Effect.fork(
				Effect.gen(function* () {
					yield* Ref.update(jobs, (map) => {
						const job = map.get(id);
						if (job) {
							map.set(id, {
								...job,
								status: "executing",
								startedAt: new Date(),
							});
						}
						return map;
					});

					const result = yield* Effect.either(task);

					if (Effect.isEitherSuccess(result)) {
						yield* Ref.update(jobs, (map) => {
							const job = map.get(id);
							if (job) {
								map.set(id, {
									...job,
									status: "completed",
									completedAt: new Date(),
								});
							}
							return map;
						});
					} else {
						const error = result.left;
						const jobMap = yield* Ref.get(jobs);
						const job = jobMap.get(id);

						if (job?.maxRetries && job.retryCount < job.maxRetries) {
							yield* Ref.update(jobs, (map) => {
								const j = map.get(id);
								if (j) {
									map.set(id, {
										...j,
										retryCount: j.retryCount + 1,
										status: "scheduled",
									});
								}
								return map;
							});

							const retryDelay = 1000 * 2 ** job.retryCount;
							yield* Effect.sleep(retryDelay);
							yield* schedule(task, new Date(), {
								maxRetries: job.maxRetries,
								jobId: job.jobId,
							});
						} else {
							yield* Ref.update(jobs, (map) => {
								const j = map.get(id);
								if (j) {
									map.set(id, {
										...j,
										status: "failed",
										completedAt: new Date(),
										error:
											error instanceof Error ? error.message : String(error),
									});
								}
								return map;
							});
						}
					}
				}),
			);

			yield* Ref.update(fibers, (map) => {
				map.set(id, fiber);
				return map;
			});

			return id;
		});

	const cancel = (id: string) =>
		Effect.gen(function* () {
			const fiberMap = yield* Ref.get(fibers);
			const fiber = fiberMap.get(id);

			if (!fiber) {
				return yield* Effect.fail(new DelayedJobNotFoundError({ id }));
			}

			yield* Fiber.interrupt(fiber);
			yield* Ref.update(fibers, (map) => {
				map.delete(id);
				return map;
			});

			yield* Ref.update(jobs, (map) => {
				const job = map.get(id);
				if (job) {
					map.set(id, { ...job, status: "cancelled", completedAt: new Date() });
				}
				return map;
			});
		});

	const getById = (id: string) =>
		Ref.get(jobs).pipe(Effect.map((map) => Option.fromNullable(map.get(id))));

	const listAll = () =>
		Ref.get(jobs).pipe(Effect.map((map) => Array.from(map.values())));

	const listByStatus = (status: DelayedJobStatus) =>
		Ref.get(jobs).pipe(
			Effect.map((map) =>
				Array.from(map.values()).filter((j) => j.status === status),
			),
		);

	const delete_ = (id: string) =>
		Effect.gen(function* () {
			const fiberMap = yield* Ref.get(fibers);
			const fiber = fiberMap.get(id);

			if (fiber) {
				yield* Fiber.interrupt(fiber);
			}

			yield* Ref.update(fibers, (map) => {
				map.delete(id);
				return map;
			});

			yield* Ref.update(jobs, (map) => {
				map.delete(id);
				return map;
			});
		});

	return { schedule, cancel, getById, listAll, listByStatus, delete: delete_ };
});

export class DelayedJobServiceTag extends Context.Tag(
	"@wpackages/DelayedJobService",
)<
	DelayedJobServiceTag,
	ReturnType<
		typeof makeDelayedJobService extends Effect.Effect<infer A> ? A : never
	>
>() {}

export const DelayedJobServiceLive = Layer.effect(
	DelayedJobServiceTag,
	makeDelayedJobService,
);
