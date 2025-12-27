// Parse git URL
export const parseGitUrl = (
	url: string,
): { host: string; owner: string; repo: string } | null => {
	// SSH format: git@github.com:owner/repo.git
	const sshMatch = url.match(/git@(.+?):(.+?)\/(.+?)(?:\.git)?$/);
	if (sshMatch) {
		return {
			host: sshMatch[1] ?? "",
			owner: sshMatch[2] ?? "",
			repo: sshMatch[3] ?? "",
		};
	}

	// HTTPS format: https://github.com/owner/repo.git
	const httpsMatch = url.match(/https?:\/\/(.+?)\/(.+?)\/(.+?)(?:\.git)?$/);
	if (httpsMatch) {
		return {
			host: httpsMatch[1] ?? "",
			owner: httpsMatch[2] ?? "",
			repo: httpsMatch[3] ?? "",
		};
	}

	return null;
};

// Format commit hash (short)
export const formatCommitHash = (hash: string, length = 7): string => {
	return hash.substring(0, length);
};

// Parse branch name from ref
export const parseBranchName = (ref: string): string => {
	return ref.replace(/^refs\/heads\//, "");
};

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
): {
	hash: string;
	shortHash: string;
	author: string;
	email: string;
	date: Date;
	message: string;
	body?: string;
} | null => {
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
): { name: string; current: boolean } | null => {
	if (!line) return null;
	const isCurrent = line.startsWith("*");
	const name = line.replace(/^\*?\s+/, "");
	return { current: isCurrent, name };
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
): {
	index: number;
	branch: string;
	message: string;
	date: Date;
} | null => {
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
): {
	hash: string;
	shortHash: string;
	action: string;
	message: string;
	date: Date;
} | null => {
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

// Split and filter lines
export const splitLines = (text: string): readonly string[] => {
	return text.split("\n").filter((line) => line.trim() !== "");
};

// Compact array (remove empty strings)
export const compact = <T>(arr: readonly T[]): readonly T[] => {
	return arr.filter((item) => item !== "" && item != null);
};
