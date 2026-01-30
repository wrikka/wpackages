import { describe, expect, it } from "vitest";
import {
	formatAuthor,
	formatBranchName,
	formatBulletList,
	formatCommitCount,
	formatCommitMessage,
	formatCommitMessageShort,
	formatDateISO,
	formatDateLocale,
	formatDiffStats,
	formatFileCount,
	formatFileSize,
	formatFileStatus,
	formatGitUrl,
	formatHash,
	formatLineCount,
	formatList,
	formatNumberedList,
	formatRelativeTime,
	formatRemoteBranch,
	parseAuthor,
	truncate,
} from "./format.utils";

describe("formatHash", () => {
	it("should format hash with default length", () => {
		expect(formatHash("1234567890abcdef")).toBe("1234567");
	});

	it("should format hash with specified length", () => {
		expect(formatHash("1234567890abcdef", 10)).toBe("1234567890");
	});

	it("should handle short hash", () => {
		expect(formatHash("1234", 7)).toBe("1234");
	});
});

describe("formatFileSize", () => {
	it("should format bytes correctly", () => {
		expect(formatFileSize(1024)).toBe("1 KB");
		expect(formatFileSize(1024 * 1024 * 5)).toBe("5 MB");
	});
});

describe("formatRelativeTime", () => {
	it("should return 'just now' for recent dates", () => {
		expect(formatRelativeTime(new Date())).toContain("just now");
	});

	it("should format time correctly for past dates", () => {
		const now = new Date();
		const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
		expect(formatRelativeTime(pastDate)).toBe("2 days ago");
	});
});

describe("formatBranchName", () => {
	it("should remove refs/heads/ prefix", () => {
		expect(formatBranchName("refs/heads/main")).toBe("main");
	});
});

describe("formatCommitMessageShort", () => {
	it("should return the first line of the commit message", () => {
		expect(formatCommitMessageShort("feat: add new feature\n\nThis is a new feature.")).toBe("feat: add new feature");
	});
});

describe("parseAuthor", () => {
	it("should parse author string correctly", () => {
		expect(parseAuthor("John Doe <john.doe@example.com>")).toEqual({ name: "John Doe", email: "john.doe@example.com" });
	});
});

describe("formatDateISO", () => {
	it("should format date to ISO string", () => {
		const date = new Date("2023-01-01T12:00:00.000Z");
		expect(formatDateISO(date)).toBe("2023-01-01T12:00:00.000Z");
	});
});

describe("formatDateLocale", () => {
	it("should format date to locale string", () => {
		const date = new Date("2023-01-01T12:00:00.000Z");
		expect(formatDateLocale(date, "en-US")).toContain("1/1/2023");
	});
});

describe("formatRemoteBranch", () => {
	it("should remove origin/ prefix", () => {
		expect(formatRemoteBranch("origin/main")).toBe("main");
	});
});

describe("formatCommitMessage", () => {
	it("should format commit message with subject and body", () => {
		const message = "feat: new feature\n\nDetails about the feature.";
		expect(formatCommitMessage(message)).toEqual({ subject: "feat: new feature", body: "Details about the feature." });
	});
});

describe("formatAuthor", () => {
	it("should format author name and email", () => {
		expect(formatAuthor("John Doe", "john.doe@example.com")).toBe("John Doe <john.doe@example.com>");
	});
});

describe("formatGitUrl", () => {
	it("should hide credentials in git URL", () => {
		expect(formatGitUrl("https://user:pass@github.com/repo.git")).toBe("https://***:***@github.com/repo.git");
	});
});

describe("formatFileStatus", () => {
	it("should return correct status string", () => {
		expect(formatFileStatus("M")).toBe("Modified");
		expect(formatFileStatus("A")).toBe("Added");
	});
});

describe("formatDiffStats", () => {
	it("should format additions and deletions", () => {
		expect(formatDiffStats(10, 5)).toBe("+10 -5");
	});
});

describe("formatCommitCount", () => {
	it("should format commit count correctly", () => {
		expect(formatCommitCount(1)).toBe("1 commit");
		expect(formatCommitCount(5)).toBe("5 commits");
	});
});

describe("formatFileCount", () => {
	it("should format file count correctly", () => {
		expect(formatFileCount(1)).toBe("1 file");
		expect(formatFileCount(3)).toBe("3 files");
	});
});

describe("formatLineCount", () => {
	it("should format line count correctly", () => {
		expect(formatLineCount(1)).toBe("1 line");
		expect(formatLineCount(100)).toBe("100 lines");
	});
});

describe("truncate", () => {
	it("should truncate text correctly", () => {
		expect(truncate("This is a long text", 10)).toBe("This is...");
	});
});

describe("formatList", () => {
	it("should format a list with a separator", () => {
		expect(formatList(["a", "b", "c"])).toBe("a, b, c");
	});
});

describe("formatNumberedList", () => {
	it("should format a numbered list", () => {
		expect(formatNumberedList(["one", "two"])).toBe("1. one\n2. two");
	});
});

describe("formatBulletList", () => {
	it("should format a bullet list", () => {
		expect(formatBulletList(["one", "two"])).toBe("• one\n• two");
	});
});
