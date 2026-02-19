import { execa } from "execa";
import { CONVENTIONAL_COMMIT_REGEX } from "../constant/index";
import type { Commit, CommitType } from "../types/index";

export class GitService {
	async isGitRepository(): Promise<boolean> {
		try {
			const result = await execa("git", ["rev-parse", "--git-dir"], {
				reject: false,
			});
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	async getCurrentBranch(): Promise<string> {
		const result = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
		return result.stdout.trim();
	}

	async hasRemote(): Promise<boolean> {
		try {
			const result = await execa("git", ["remote"], { reject: false });
			return result.exitCode === 0 && result.stdout.trim().length > 0;
		} catch {
			return false;
		}
	}

	async getCommits(from?: string, to = "HEAD"): Promise<Commit[]> {
		const range = from ? `${from}..${to}` : to;
		const args = ["log", range, "--format=%H|||%s|||%b|||%an|||%aI"];

		if (!from) {
			args.push("--max-count=200");
		}

		const result = await execa("git", args, {
			reject: false,
		});

		if (!result.stdout) return [];

		const commits: Commit[] = [];
		const lines = result.stdout.split("\n").filter(Boolean);

		for (const line of lines) {
			const [hash, subject, body, author, date] = line.split("|||");
			if (!hash || !subject) continue;

			const match = subject.match(CONVENTIONAL_COMMIT_REGEX);

			if (match) {
				const [, type, scope, breaking, message] = match;
				const commit: Commit = {
					author: author ?? "",
					body: body ?? "",
					breaking: !!breaking,
					date: date ?? "",
					hash,
					subject: message ?? subject,
					type: type as CommitType,
				};
				if (scope) {
					commit.scope = scope;
				}
				commits.push(commit);
			} else {
				commits.push({
					author: author ?? "",
					body: body ?? "",
					breaking: subject.toLowerCase().includes("breaking"),
					date: date ?? "",
					hash,
					subject,
				});
			}
		}

		return commits;
	}

	async commit(message: string, files: string[] = ["."]): Promise<void> {
		await execa("git", ["add", ...files]);
		await execa("git", ["commit", "-m", message]);
	}

	async tag(tagName: string, message?: string): Promise<void> {
		const args = message
			? ["tag", "-a", tagName, "-m", message]
			: ["tag", tagName];
		await execa("git", args);
	}

	async push(includeTags = true): Promise<void> {
		await execa("git", ["push"]);
		if (includeTags) {
			await execa("git", ["push", "--tags"]);
		}
	}

	async hasUncommittedChanges(): Promise<boolean> {
		const result = await execa("git", ["status", "--porcelain"], {
			reject: false,
		});
		return !!result.stdout;
	}

	async getLastTag(): Promise<string | undefined> {
		try {
			const result = await execa("git", ["describe", "--tags", "--abbrev=0"], {
				reject: false,
			});
			return result.exitCode === 0 ? result.stdout.trim() : undefined;
		} catch {
			return undefined;
		}
	}

	async tagExists(tagName: string): Promise<boolean> {
		try {
			const result = await execa("git", ["tag", "-l", tagName], {
				reject: false,
			});
			return result.exitCode === 0 && result.stdout.trim() === tagName;
		} catch {
			return false;
		}
	}
}
