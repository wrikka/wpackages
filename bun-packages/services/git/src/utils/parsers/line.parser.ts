import type { GitBranch, GitCommit, GitStash } from "../../types/objects";
import type { GitReflogEntry } from "../../types/operations";

// Parse status line
export const parseStatusLine = (
	line: string,
): { status: string; file: string } | null => {
	if (!line || line.length < 3) return null;
	return {
		file: line.substring(3),
		status: line.substring(0, 2),
	};
};

// Parse commit line from log
export const parseCommitLine = (
	line: string,
): GitCommit | null => {
	const parts = line.split("|");
	if (parts.length < 6) return null;

	const base = {
		author: parts[2] ?? "",
		date: new Date(parts[4] ?? ""),
		email: parts[3] ?? "",
		hash: parts[0] ?? "",
		message: parts[5] ?? "",
		shortHash: parts[1] ?? "",
	};

	return parts[6] ? { ...base, body: parts[6] } : base;
};

// Parse branch line
export const parseBranchLine = (
	line: string,
): GitBranch | null => {
	if (!line) return null;
	const isCurrent = line.startsWith("*");
	const cleanLine = line.substring(isCurrent ? 1 : 0);
	const [name, remote] = cleanLine.split("|");
	if (!name) return null;

	return {
		name,
		current: isCurrent,
		...(remote && remote !== "" ? { remote } : {}),
	};
};

// Parse remote line
export const parseRemoteLine = (
	line: string,
): {
	name: string;
	url: string;
	type: "fetch" | "push";
} | null => {
	const parts = line.split(/\s+/);
	if (parts.length < 3) return null;

	return {
		name: parts[0] ?? "",
		type: parts[2]?.includes("fetch") ? "fetch" : "push",
		url: parts[1] ?? "",
	};
};

// Parse stash line
export const parseStashLine = (
	line: string,
	index: number,
): GitStash | null => {
	if (!line) return null;
	const match = line.match(/stash@\{(\d+)\}: (WIP on|On) (.+?): (.+)/);
	if (!match) return { branch: "", date: new Date(), index, message: line };

	return {
		branch: match[3] ?? "",
		date: new Date(),
		index,
		message: match[4] ?? line,
	};
};

// Parse reflog line
export const parseReflogLine = (
	line: string,
): GitReflogEntry | null => {
	const parts = line.split("|");
	if (parts.length < 4) return null;

	return {
		action: parts[3] ?? "",
		date: new Date(),
		hash: parts[0] ?? "",
		message: parts[2] ?? "",
		shortHash: parts[1] ?? "",
	};
};
