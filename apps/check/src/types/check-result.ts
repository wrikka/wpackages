export type CheckSeverity = "error" | "warning" | "info";

export type CheckStatus = "passed" | "failed" | "skipped";

export type CheckIssue = {
	severity: CheckSeverity;
	message: string;
	file?: string;
	line?: number;
	column?: number;
	code?: string;
	suggestion?: string;
};

export type CheckResult = {
	name: string;
	status: CheckStatus;
	duration: number;
	issues: CheckIssue[];
	summary?: string;
};

export type CheckResults = {
	passed: number;
	failed: number;
	skipped: number;
	total: number;
	duration: number;
	results: CheckResult[];
};
