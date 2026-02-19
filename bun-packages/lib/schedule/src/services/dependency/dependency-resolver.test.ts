import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
	CircularDependencyError,
	DependencyNotFoundError,
} from "../../types/dependency";
import type { Job } from "../../types/job";
import {
	buildDependencyGraph,
	detectCircularDependencies,
	getReadyJobs,
	resolveDependencies,
	validateDependencies,
} from "./dependency-resolver";

describe("DependencyResolver", () => {
	const createMockJob = (
		id: string,
		dependencies?: Array<{
			jobId: string;
			type: "success" | "completion" | "failure";
		}>,
	): Job => ({
		id,
		name: `job-${id}`,
		cron: "0 * * * *",
		priority: "normal",
		status: "pending",
		enabled: true,
		timezone: "UTC",
		createdAt: new Date(),
		updatedAt: new Date(),
		nextRunAt: new Date(),
		runCount: 0,
		failureCount: 0,
		dependencies,
	});

	it("should build dependency graph correctly", () => {
		const jobs = [
			createMockJob("1"),
			createMockJob("2", [{ jobId: "1", type: "success" }]),
		];
		const graph = buildDependencyGraph(jobs);

		assert.strictEqual(graph.nodes.size, 2);
		assert.strictEqual(graph.edges.size, 1);
		assert.ok(graph.edges.get("2"));
	});

	it("should detect circular dependencies", () =>
		Effect.gen(function* () {
			const jobs = [
				createMockJob("1", [{ jobId: "2", type: "success" }]),
				createMockJob("2", [{ jobId: "1", type: "success" }]),
			];
			const graph = buildDependencyGraph(jobs);

			const result = yield* Effect.flip(detectCircularDependencies(graph));
			assert.ok(result instanceof CircularDependencyError);
		}).pipe(Effect.runSync));

	it("should detect missing dependencies", () =>
		Effect.gen(function* () {
			const jobs = [createMockJob("1", [{ jobId: "999", type: "success" }])];

			const result = yield* Effect.flip(validateDependencies(jobs));
			assert.ok(result instanceof DependencyNotFoundError);
		}).pipe(Effect.runSync));

	it("should resolve dependencies correctly", () => {
		const jobs = [
			createMockJob("1"),
			createMockJob("2", [{ jobId: "1", type: "success" }]),
			createMockJob("3", [{ jobId: "2", type: "success" }]),
		];
		const graph = buildDependencyGraph(jobs);
		const statuses = new Map<
			string,
			"pending" | "running" | "completed" | "failed"
		>([
			["1", "pending"],
			["2", "pending"],
			["3", "pending"],
		]);

		const resolutions = resolveDependencies(graph, statuses);

		assert.strictEqual(resolutions.length, 3);
		assert.strictEqual(resolutions[0].status, "ready");
		assert.strictEqual(resolutions[1].status, "blocked");
		assert.strictEqual(resolutions[2].status, "blocked");
	});

	it("should get ready jobs", () => {
		const jobs = [
			createMockJob("1"),
			createMockJob("2", [{ jobId: "1", type: "success" }]),
		];
		const graph = buildDependencyGraph(jobs);
		const statuses = new Map([
			["1", "pending"],
			["2", "pending"],
		]);

		const resolutions = resolveDependencies(graph, statuses);
		const readyJobs = getReadyJobs(resolutions);

		assert.strictEqual(readyJobs.length, 1);
		assert.strictEqual(readyJobs[0], "1");
	});

	it("should validate valid dependencies", () =>
		Effect.gen(function* () {
			const jobs = [
				createMockJob("1"),
				createMockJob("2", [{ jobId: "1", type: "success" }]),
			];

			yield* validateDependencies(jobs);
		}).pipe(Effect.runSync));
});
