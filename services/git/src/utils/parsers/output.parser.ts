import { Option } from "effect";
import type { GitBranch, GitCommit, GitRemote, GitStash, GitStatus } from "../../types/objects";
import type { GitBlameLine, GitDiff, GitReflogEntry } from "../../types/operations";
import { splitLines } from "./helpers";
import {
	parseBranchLine,
	parseCommitLine,
	parseReflogLine,
	parseRemoteLine,
	parseStashLine,
} from "./line.parser";

// Parse multiple remote lines
export const parseGitRemotes = (
	output: string,
): readonly GitRemote[] => {
	return splitLines(output)
		.map(parseRemoteLine)
		.filter((remote): remote is GitRemote => remote !== null);
};

// Parse git diff --numstat output
export const parseGitDiff = (output: string): readonly GitDiff[] => {
	return splitLines(output).map((line: string) => {
		const [additions, deletions, file] = line.split("\t");
		return {
			file: file ?? "",
			additions: parseInt(additions ?? "0", 10),
			deletions: parseInt(deletions ?? "0", 10),
			changes: [], // --numstat doesn't provide line-by-line changes
		};
	});
};

// Parse git blame output
export const parseGitBlame = (output: string): readonly GitBlameLine[] => {
	const lines: GitBlameLine[] = [];
	const lineRegex = /^([a-f0-9^]+)\s+.*?\((.+?)\s+(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s[+-]\d{4})\s+(\d+)\)(.*)$/;

	splitLines(output).forEach((line: string) => {
		const match = line.match(lineRegex);
		if (match) {
			const [, hash, author, dateStr, lineNum, content] = match;
			lines.push({
				line: parseInt(lineNum ?? "0", 10),
				hash: hash ?? "",
				author: author?.trim() ?? "",
				date: new Date(dateStr ?? ""),
				content: content ?? "",
			});
		}
	});
	return lines;
};

// Parse multiple stash lines
export const parseGitStashes = (
	output: string,
): readonly GitStash[] => {
	return splitLines(output)
		.map((line: string, index: number) => parseStashLine(line, index))
		.filter((stash): stash is GitStash => stash !== null);
};

// Parse multiple reflog lines
export const parseGitReflog = (
	output: string,
): readonly GitReflogEntry[] => {
	return splitLines(output)
		.map(parseReflogLine)
		.filter((entry): entry is GitReflogEntry => entry !== null);
};

// Parse multiple branch lines
export const parseGitBranches = (
	output: string,
): readonly GitBranch[] => {
	return splitLines(output)
		.map(parseBranchLine)
		.filter((branch): branch is GitBranch => branch !== null);
};

// Parse git log output
export const parseGitStatus = (output: string): GitStatus => {
	const lines = splitLines(output);
	const branchLine = lines.shift();
	if (!branchLine) {
		throw new Error("Could not determine branch from git status.");
	}

	const branchMatch = branchLine.match(/^## (\S+?)(?:\.\.\.(\S+))?(?: \[ahead (\d+)\])?(?: \[behind (\d+)\])?$/);
	const branch = branchMatch?.[1] || "";
	const ahead = Option.fromNullable(branchMatch?.[3]).pipe(Option.map(s => parseInt(s, 10)), Option.getOrElse(() => 0));
	const behind = Option.fromNullable(branchMatch?.[4]).pipe(
		Option.map(s => parseInt(s, 10)),
		Option.getOrElse(() => 0),
	);

	const staged: string[] = [];
	const modified: string[] = [];
	const untracked: string[] = [];
	const deleted: string[] = [];

	for (const line of lines) {
		const status = line.substring(0, 2);
		const file = line.substring(3);

		if (status.startsWith("??")) {
			untracked.push(file);
		} else {
			const indexStatus = status[0];
			const workTreeStatus = status[1];

			if (indexStatus !== " ") staged.push(file);
			if (workTreeStatus === "M") modified.push(file);
			if (workTreeStatus === "D" || indexStatus === "D") deleted.push(file);
		}
	}

	return { branch, ahead, behind, staged, modified, untracked, deleted };
};

export const parseGitLog = (output: string): readonly GitCommit[] => {
	return splitLines(output)
		.map((line: string) => {
			const parts: string[] = [];
			let remaining = line;
			for (let i = 0; i < 5; i++) {
				const index = remaining.indexOf("|");
				if (index === -1) return null;
				parts.push(remaining.substring(0, index));
				remaining = remaining.substring(index + 1);
			}
			parts.push(remaining);

			const [hash, shortHash, author, email, dateStr, message] = parts;

			if (!hash || !shortHash || !author || !email || !dateStr || !message || !/^\d+$/.test(dateStr)) {
				return null;
			}

			return {
				hash,
				shortHash,
				author,
				email,
				date: new Date(parseInt(dateStr, 10) * 1000),
				message,
			};
		})
		.filter((commit): commit is GitCommit => commit !== null);
};

// Parse a single commit line (alias for parseCommitLine)
export const parseSingleCommit = parseCommitLine;
