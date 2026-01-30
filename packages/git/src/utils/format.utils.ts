// Format utilities for Git data

// Format commit hash with custom length
export const formatHash = (hash: string, length = 7): string => {
	return hash.substring(0, Math.max(1, Math.min(length, hash.length)));
};

// Format file size to human readable
export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B";

	const units = ["B", "KB", "MB", "GB", "TB"];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${units[i]}`;
};

// Format date to relative time
export const formatRelativeTime = (date: Date): string => {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);
	const diffWeek = Math.floor(diffDay / 7);
	const diffMonth = Math.floor(diffDay / 30);
	const diffYear = Math.floor(diffDay / 365);

	if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
	if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
	if (diffWeek > 0) return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;
	if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
	if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
	if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
	if (diffSec > 0) return `${diffSec} second${diffSec > 1 ? "s" : ""} ago`;

	return "just now";
};

// Format date to ISO string
export const formatDateISO = (date: Date): string => {
	return date.toISOString();
};

// Format date to locale string
export const formatDateLocale = (date: Date, locale = "th-TH"): string => {
	return date.toLocaleString(locale);
};

// Format branch name (remove refs/heads/)
export const formatBranchName = (ref: string): string => {
	return ref.replace(/^refs\/heads\//, "").replace(/^refs\/remotes\//, "");
};

// Format remote name (remove origin/)
export const formatRemoteBranch = (branch: string): string => {
	return branch.replace(/^origin\//, "");
};

// Format commit message (first line only)
export const formatCommitMessageShort = (message: string): string => {
	return message.split("\n")[0]?.trim() ?? "";
};

// Format commit subject and body
export const formatCommitMessage = (
	message: string,
): { subject: string; body?: string } => {
	const lines = message.split("\n");
	const subject = lines[0]?.trim() ?? "";
	const body = lines.slice(1).join("\n").trim();

	return body ? { body, subject } : { subject };
};

// Format author name and email
export const formatAuthor = (name: string, email: string): string => {
	return `${name} <${email}>`;
};

// Parse author string
export const parseAuthor = (
	author: string,
): { name: string; email: string } | null => {
	const match = author.match(/^(.+?)\s*<(.+?)>$/);
	if (!match) return null;

	return {
		email: match[2]?.trim() ?? "",
		name: match[1]?.trim() ?? "",
	};
};

// Format git URL for display
export const formatGitUrl = (url: string): string => {
	// Hide credentials if present
	return url.replace(/\/\/(.+?):(.+?)@/, "//***:***@");
};

// Format file status for display
export const formatFileStatus = (status: string): string => {
	const statusMap: Record<string, string> = {
		"!": "Ignored",
		"?": "Untracked",
		A: "Added",
		C: "Copied",
		D: "Deleted",
		M: "Modified",
		R: "Renamed",
		U: "Unmerged",
	};

	return statusMap[status] ?? status;
};

// Format diff stats
export const formatDiffStats = (
	additions: number,
	deletions: number,
): string => {
	const total = additions + deletions;
	if (total === 0) return "no changes";

	return `+${additions} -${deletions}`;
};

// Format commit count
export const formatCommitCount = (count: number): string => {
	return `${count} commit${count !== 1 ? "s" : ""}`;
};

// Format file count
export const formatFileCount = (count: number): string => {
	return `${count} file${count !== 1 ? "s" : ""}`;
};

// Format line count
export const formatLineCount = (count: number): string => {
	return `${count} line${count !== 1 ? "s" : ""}`;
};

// Truncate text with ellipsis
export const truncate = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return `${text.substring(0, maxLength - 3)}...`;
};

// Format list of items
export const formatList = (
	items: readonly string[],
	separator = ", ",
): string => {
	return items.join(separator);
};

// Format numbered list
export const formatNumberedList = (items: readonly string[]): string => {
	return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
};

// Format bullet list
export const formatBulletList = (items: readonly string[]): string => {
	return items.map((item) => `• ${item}`).join("\n");
};
