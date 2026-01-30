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

// Split and filter lines
export const splitLines = (text: string): readonly string[] => {
	return text.split("\n").filter((line) => line.trim() !== "");
};

// Compact array (remove empty strings)
export const compact = <T>(arr: readonly T[]): readonly T[] => {
	return arr.filter((item) => item !== "" && item != null);
};
