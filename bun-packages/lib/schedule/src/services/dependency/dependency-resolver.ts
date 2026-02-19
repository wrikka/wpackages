import { Effect } from "effect";
import type {
	DependencyGraph,
	DependencyResolution,
	DependencyType,
} from "../../types/dependency";
import {
	CircularDependencyError,
	DependencyNotFoundError,
} from "../../types/dependency";
import type { Job, JobDependency } from "../../types/job";

export const buildDependencyGraph = (
	jobs: ReadonlyArray<Job>,
): DependencyGraph => {
	const nodes = new Map(jobs.map((job) => [job.id, job]));
	const edges = new Map<string, ReadonlyArray<JobDependency>>();

	for (const job of jobs) {
		if (job.dependencies && job.dependencies.length > 0) {
			edges.set(job.id, job.dependencies);
		}
	}

	return { nodes, edges };
};

export const detectCircularDependencies = (
	graph: DependencyGraph,
): Effect.Effect<never, CircularDependencyError, void> => {
	return Effect.gen(function* () {
		const visited = new Set<string>();
		const recursionStack = new Set<string>();
		const cycle: string[] = [];

		const detectCycle = (jobId: string): boolean => {
			if (recursionStack.has(jobId)) {
				cycle.push(jobId);
				return true;
			}
			if (visited.has(jobId)) {
				return false;
			}

			visited.add(jobId);
			recursionStack.add(jobId);

			const dependencies = graph.edges.get(jobId) ?? [];
			for (const dep of dependencies) {
				if (detectCycle(dep.jobId)) {
					if (cycle[0] === dep.jobId) {
						cycle.push(jobId);
					}
					return true;
				}
			}

			recursionStack.delete(jobId);
			return false;
		};

		for (const jobId of graph.nodes.keys()) {
			if (!visited.has(jobId)) {
				if (detectCycle(jobId)) {
					return yield* Effect.fail(new CircularDependencyError(cycle));
				}
			}
		}
	});
};

export const resolveDependencies = (
	graph: DependencyGraph,
	jobStatuses: ReadonlyMap<
		string,
		"pending" | "running" | "completed" | "failed"
	>,
): ReadonlyArray<DependencyResolution> => {
	const resolutions: DependencyResolution[] = [];

	for (const [jobId, _job] of graph.nodes.entries()) {
		const dependencies = graph.edges.get(jobId) ?? [];
		const blockedBy: string[] = [];
		let status: DependencyResolution["status"] = "pending";

		if (dependencies.length === 0) {
			status = "ready";
		} else {
			for (const dep of dependencies) {
				const depStatus = jobStatuses.get(dep.jobId);

				if (!depStatus) {
					blockedBy.push(dep.jobId);
					status = "blocked";
					continue;
				}

				switch (dep.type) {
					case "success":
						if (depStatus !== "completed") {
							blockedBy.push(dep.jobId);
							status = "blocked";
						}
						break;
					case "completion":
						if (depStatus !== "completed" && depStatus !== "failed") {
							blockedBy.push(dep.jobId);
							status = "blocked";
						}
						break;
					case "failure":
						if (depStatus !== "failed") {
							blockedBy.push(dep.jobId);
							status = "blocked";
						}
						break;
				}
			}

			if (blockedBy.length === 0 && status === "pending") {
				status = "ready";
			}
		}

		const currentStatus = jobStatuses.get(jobId);
		if (currentStatus === "running") {
			status = "running";
		} else if (currentStatus === "completed") {
			status = "completed";
		} else if (currentStatus === "failed") {
			status = "failed";
		}

		resolutions.push({
			jobId,
			status,
			blockedBy,
			dependsOn: dependencies,
		});
	}

	return resolutions;
};

export const getReadyJobs = (
	resolutions: ReadonlyArray<DependencyResolution>,
): ReadonlyArray<string> => {
	return resolutions.filter((r) => r.status === "ready").map((r) => r.jobId);
};

export const validateDependencies = (
	jobs: ReadonlyArray<Job>,
): Effect.Effect<
	never,
	CircularDependencyError | DependencyNotFoundError,
	void
> => {
	return Effect.gen(function* () {
		const graph = buildDependencyGraph(jobs);

		for (const job of jobs) {
			if (job.dependencies) {
				for (const dep of job.dependencies) {
					if (!graph.nodes.has(dep.jobId)) {
						return yield* Effect.fail(new DependencyNotFoundError(dep.jobId));
					}
				}
			}
		}

		yield* detectCircularDependencies(graph);
	});
};
