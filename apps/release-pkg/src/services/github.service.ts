import { execa } from "execa";

export interface GitHubPRInfo {
	number: number;
	title: string;
	author: string;
	branch: string;
	baseBranch: string;
	url: string;
}

export interface GitHubCommentOptions {
	owner: string;
	repo: string;
	prNumber: number;
	body: string;
	token: string;
}

export class GitHubService {
	/**
	 * Get current PR information from GitHub CLI
	 */
	async getCurrentPR(): Promise<GitHubPRInfo | null> {
		try {
			const result = await execa("gh", [
				"pr",
				"view",
				"--json",
				"number,title,author,headRefName,baseRefName,url",
			]);

			const data = JSON.parse(result.stdout);

			return {
				number: data.number,
				title: data.title,
				author: data.author.login,
				branch: data.headRefName,
				baseBranch: data.baseRefName,
				url: data.url,
			};
		} catch {
			return null;
		}
	}

	/**
	 * Post comment to PR
	 */
	async postPRComment(options: GitHubCommentOptions): Promise<void> {
		const { owner, repo, prNumber, body, token } = options;

		await execa("gh", [
			"pr",
			"comment",
			prNumber.toString(),
			"--repo",
			`${owner}/${repo}`,
			"--body",
			body,
		], {
			env: {
				...process.env,
				GH_TOKEN: token,
			},
		});
	}

	/**
	 * Get repository info
	 */
	async getRepoInfo(): Promise<{ owner: string; repo: string } | null> {
		try {
			const result = await execa("gh", ["repo", "view", "--json", "owner,name"]);
			const data = JSON.parse(result.stdout);

			return {
				owner: data.owner.login,
				repo: data.name,
			};
		} catch {
			return null;
		}
	}

	/**
	 * Check if gh CLI is available
	 */
	async isGHInstalled(): Promise<boolean> {
		try {
			await execa("gh", ["--version"]);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Check if authenticated with GitHub
	 */
	async isAuthenticated(): Promise<boolean> {
		try {
			await execa("gh", ["auth", "status"]);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get workflow run status
	 */
	async getWorkflowStatus(
		runId: string,
	): Promise<"success" | "failure" | "pending" | "cancelled"> {
		try {
			const result = await execa("gh", [
				"run",
				"view",
				runId,
				"--json",
				"status,conclusion",
			]);

			const data = JSON.parse(result.stdout);

			if (data.status === "completed") {
				return data.conclusion === "success" ? "success" : "failure";
			}

			if (data.status === "cancelled") {
				return "cancelled";
			}

			return "pending";
		} catch {
			return "failure";
		}
	}
}
