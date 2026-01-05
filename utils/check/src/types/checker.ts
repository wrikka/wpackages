export type CheckType =
	| "type"
	| "unused"
	| "deps"
	| "depsUpdate"
	| "imports"
	| "circular"
	| "size"
	| "complexity"
	| "duplicates"
	| "security"
	| "sideEffect"
	| "responsibility"
	| "type-analysis";

export type CheckerOptions = {
	types: CheckType[];
	include: string[];
	exclude: string[];
	fix?: boolean;
	parallel?: boolean;
	maxConcurrency?: number;
	verbose?: boolean;
	silent?: boolean;
	output?: "json" | "text" | "table";
};

export type DependencyInfo = {
	name: string;
	version: string;
	latest?: string;
	isUsed: boolean;
	isOutdated: boolean;
	hasVulnerability?: boolean;
};

export type FileInfo = {
	path: string;
	size: number;
	lines: number;
	complexity?: number;
	imports?: string[];
	exports?: string[];
};
