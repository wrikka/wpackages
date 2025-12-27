export type ReleaseType =
	| "major"
	| "minor"
	| "patch"
	| "premajor"
	| "preminor"
	| "prepatch"
	| "prerelease";

export type VersionBump = {
	from: string;
	to: string;
	type: ReleaseType;
};

export type CommitType =
	| "feat"
	| "fix"
	| "docs"
	| "style"
	| "refactor"
	| "perf"
	| "test"
	| "build"
	| "ci"
	| "chore"
	| "revert";

export type Commit = {
	hash: string;
	type?: CommitType;
	scope?: string;
	subject: string;
	body?: string;
	breaking: boolean;
	author?: string;
	date?: string;
};

export type ChangelogEntry = {
	version: string;
	date: string;
	commits: Commit[];
	breaking: Commit[];
	features: Commit[];
	fixes: Commit[];
	others: Commit[];
};

export type ReleaseOptions = {
	type?: ReleaseType | undefined;
	version?: string | undefined;
	preid?: string | undefined;
	dryRun?: boolean | undefined;
	ci?: boolean | undefined;
	noGit?: boolean | undefined;
	noChangelog?: boolean | undefined;
	noPublish?: boolean | undefined;
	tag?: string | undefined;
	message?: string | undefined;
	preScript?: string | undefined;
	postScript?: string | undefined;
	verbose?: boolean | undefined;
	silent?: boolean | undefined;
};

export type ReleaseResult = {
	success: boolean;
	version: string;
	previousVersion: string;
	changelog?: string | undefined;
	tag?: string | undefined;
	published: boolean;
	duration: number;
	commitHash?: string | undefined;
};
