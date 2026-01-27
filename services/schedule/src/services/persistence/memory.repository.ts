import { Context, Data, Effect, Layer, Ref } from "effect";
import type { Job, JobExecution, JobFilter, JobMetrics } from "../../types/job";
import type {
	ExecutionRepository,
	JobRepository,
	MetricsRepository,
} from "../../types/persistence";

export class RepositoryError extends Data.TaggedError("RepositoryError")<{
	reason: string;
}> {}

const makeJobRepository = Effect.gen(function* () {
	const jobs = yield* Ref.make(new Map<string, Job>());
	const locks = yield* Ref.make(
		new Map<string, { ownerId: string; expiresAt: number }>(),
	);

	const save = (job: Job) =>
		Ref.update(jobs, (map) => {
			map.set(job.id, job);
			return map;
		});

	const findById = (id: string) =>
		Ref.get(jobs).pipe(Effect.map((map) => Option.fromNullable(map.get(id))));

	const findByName = (name: string) =>
		Ref.get(jobs).pipe(
			Effect.map((map) =>
				Array.from(map.values()).find((j) => j.name === name),
			),
			Effect.map(Option.fromNullable),
		);

	const findAll = (filter?: JobFilter) =>
		Ref.get(jobs).pipe(
			Effect.map((map) => {
				let jobs = Array.from(map.values());

				if (filter) {
					if (filter.status?.length) {
						jobs = jobs.filter((j) => filter.status?.includes(j.status));
					}
					if (filter.priority?.length) {
						jobs = jobs.filter((j) => filter.priority?.includes(j.priority));
					}
					if (filter.name) {
						jobs = jobs.filter((j) => j.name.includes(filter.name));
					}
					if (filter.enabled !== undefined) {
						jobs = jobs.filter((j) => j.enabled === filter.enabled);
					}
					if (filter.from) {
						jobs = jobs.filter((j) => j.createdAt >= filter.from);
					}
					if (filter.to) {
						jobs = jobs.filter((j) => j.createdAt <= filter.to);
					}
				}

				return jobs;
			}),
		);

	const update = (id: string, update: Partial<Job>) =>
		Ref.get(jobs).pipe(
			Effect.flatMap((map) => {
				const job = map.get(id);
				if (!job) {
					return Effect.fail(
						new RepositoryError({ reason: `Job not found: ${id}` }),
					);
				}
				const updated = { ...job, ...update, updatedAt: new Date() };
				return save(updated);
			}),
		);

	const delete_ = (id: string) =>
		Ref.update(jobs, (map) => {
			map.delete(id);
			return map;
		});

	const lock = (id: string, ttl: number) =>
		Effect.gen(function* () {
			const now = Date.now();
			const lockMap = yield* Ref.get(locks);
			const existingLock = lockMap.get(id);

			if (existingLock && existingLock.expiresAt > now) {
				return false;
			}

			const ownerId = crypto.randomUUID();
			yield* Ref.update(locks, (map) => {
				map.set(id, { ownerId, expiresAt: now + ttl });
				return map;
			});

			return true;
		});

	const unlock = (id: string) =>
		Ref.update(locks, (map) => {
			map.delete(id);
			return map;
		});

	const findNextJobs = (limit: number) =>
		Ref.get(jobs).pipe(
			Effect.map((map) => {
				const now = new Date();
				return Array.from(map.values())
					.filter(
						(j) =>
							j.enabled &&
							j.nextRunAt &&
							j.nextRunAt <= now &&
							j.status === "pending",
					)
					.sort((a, b) => {
						const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
						const priorityDiff =
							priorityOrder[a.priority] - priorityOrder[b.priority];
						if (priorityDiff !== 0) return priorityDiff;
						return (
							(a.nextRunAt?.getTime() ?? 0) - (b.nextRunAt?.getTime() ?? 0)
						);
					})
					.slice(0, limit);
			}),
		);

	return {
		save,
		findById,
		findByName,
		findAll,
		update,
		delete: delete_,
		lock,
		unlock,
		findNextJobs,
	};
});

const makeExecutionRepository = Effect.gen(function* () {
	const executions = yield* Ref.make(new Map<string, JobExecution>());

	const save = (execution: JobExecution) =>
		Ref.update(executions, (map) => {
			map.set(execution.id, execution);
			return map;
		});

	const findById = (id: string) =>
		Ref.get(executions).pipe(
			Effect.map((map) => Option.fromNullable(map.get(id))),
		);

	const findByJobId = (jobId: string, limit = 100) =>
		Ref.get(executions).pipe(
			Effect.map((map) =>
				Array.from(map.values())
					.filter((e) => e.jobId === jobId)
					.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
					.slice(0, limit),
			),
		);

	const findRecent = (limit = 100) =>
		Ref.get(executions).pipe(
			Effect.map((map) =>
				Array.from(map.values())
					.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
					.slice(0, limit),
			),
		);

	const deleteOld = (before: Date) =>
		Ref.get(executions).pipe(
			Effect.map((map) => {
				let count = 0;
				for (const [id, exec] of map.entries()) {
					if (exec.startedAt < before) {
						map.delete(id);
						count++;
					}
				}
				return count;
			}),
		);

	return { save, findById, findByJobId, findRecent, deleteOld };
});

const makeMetricsRepository = Effect.gen(function* () {
	const metrics = yield* Ref.make(new Map<string, JobMetrics>());

	const getJobMetrics = (jobId: string) =>
		Ref.get(metrics).pipe(
			Effect.map((map) => Option.fromNullable(map.get(jobId))),
		);

	const getAllMetrics = () =>
		Ref.get(metrics).pipe(
			Effect.map((map) =>
				Array.from(map.entries()).map(([jobId, metrics]) => ({
					jobId,
					metrics,
				})),
			),
		);

	const updateMetrics = (jobId: string, execution: JobExecution) =>
		Effect.gen(function* () {
			const current = yield* getJobMetrics;
			const existing = Option.getOrElse(current, () => ({
				totalRuns: 0,
				successCount: 0,
				failureCount: 0,
				averageDuration: 0,
			}));

			const updated: JobMetrics = {
				totalRuns: existing.totalRuns + 1,
				successCount:
					execution.status === "completed"
						? existing.successCount + 1
						: existing.successCount,
				failureCount:
					execution.status === "failed"
						? existing.failureCount + 1
						: existing.failureCount,
				averageDuration: execution.duration
					? (existing.averageDuration * existing.totalRuns +
							execution.duration) /
						(existing.totalRuns + 1)
					: existing.averageDuration,
				lastRunAt: execution.startedAt,
			};

			yield* Ref.update(metrics, (map) => {
				map.set(jobId, updated);
				return map;
			});
		}).pipe(Effect.mapError(() => new Error("Failed to update metrics")) as any);

	const resetMetrics = (jobId: string) =>
		Ref.update(metrics, (map) => {
			map.delete(jobId);
			return map;
		});

	return { getJobMetrics, getAllMetrics, updateMetrics, resetMetrics };
});

export class JobRepositoryTag extends Context.Tag("@wpackages/JobRepository")<
	JobRepositoryTag,
	JobRepository
>() {}
export class ExecutionRepositoryTag extends Context.Tag(
	"@wpackages/ExecutionRepository",
)<ExecutionRepositoryTag, ExecutionRepository>() {}
export class MetricsRepositoryTag extends Context.Tag(
	"@wpackages/MetricsRepository",
)<MetricsRepositoryTag, MetricsRepository>() {}

export const JobRepositoryLive = Layer.effect(
	JobRepositoryTag,
	makeJobRepository,
);
export const ExecutionRepositoryLive = Layer.effect(
	ExecutionRepositoryTag,
	makeExecutionRepository,
);
export const MetricsRepositoryLive = Layer.effect(
	MetricsRepositoryTag,
	makeMetricsRepository,
);
