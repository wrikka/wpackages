import type { Issue } from "../types";

type FormatIssuesOptions = {
	readonly indent?: string;
	readonly bullet?: string;
};

const formatPath = (path: Issue["path"]): string => {
	if (path.length === 0) {
		return "<root>";
	}
	return path.map((p) => String(p)).join(".");
};

export const formatIssues = (
	issues: ReadonlyArray<Issue>,
	options: FormatIssuesOptions = {},
): string => {
	const indent = options.indent ?? "";
	const bullet = options.bullet ?? "-";
	return issues
		.map((issue) => {
			const path = formatPath(issue.path);
			return `${indent}${bullet} ${path}: ${issue.message}`;
		})
		.join("\n");
};
