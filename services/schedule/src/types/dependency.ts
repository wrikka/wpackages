import type { Job } from "./job";

export type DependencyType = "success" | "completion" | "failure";

export interface JobDependency {
	readonly jobId: string;
	readonly type: DependencyType;
}

export interface DependencyGraph {
	readonly nodes: ReadonlyMap<string, Job>;
	readonly edges: ReadonlyMap<string, ReadonlyArray<JobDependency>>;
}

export interface DependencyResolution {
	readonly jobId: string;
	readonly status:
		| "pending"
		| "ready"
		| "blocked"
		| "running"
		| "completed"
		| "failed";
	readonly blockedBy: ReadonlyArray<string>;
	readonly dependsOn: ReadonlyArray<JobDependency>;
}

export class CircularDependencyError extends Error {
	constructor(readonly cycle: ReadonlyArray<string>) {
		super(`Circular dependency detected: ${cycle.join(" -> ")}`);
		this.name = "CircularDependencyError";
	}
}

export class DependencyNotFoundError extends Error {
	constructor(readonly jobId: string) {
		super(`Dependency job not found: ${jobId}`);
		this.name = "DependencyNotFoundError";
	}
}
