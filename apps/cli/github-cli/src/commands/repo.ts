import { Octokit } from "octokit";
import { requireGitHubToken } from "../lib/auth";
import { printOutput } from "../lib/output";

interface RepoInfo {
	name: string;
	full_name: string;
	owner: { login: string };
	description: string | null;
	private: boolean;
	fork: boolean;
	created_at: string;
	updated_at: string;
	stargazers_count: number;
	language: string | null;
}

export async function runRepoListCommand(owner?: string): Promise<void> {
	const token = requireGitHubToken();
	const octokit = new Octokit({ auth: token });
	
	let repos: RepoInfo[];
	
	if (owner) {
		// List repos for specific owner
		const { data } = await octokit.rest.repos.listForOrg({ org: owner, type: "all" });
		repos = data;
	} else {
		// List repos for authenticated user
		const { data } = await octokit.rest.repos.listForAuthenticatedUser({ type: "all" });
		repos = data;
	}
	
	const simplified = repos.map((repo) => ({
		name: repo.name,
		full_name: repo.full_name,
		owner: repo.owner.login,
		description: repo.description,
		private: repo.private,
		fork: repo.fork,
		created_at: repo.created_at,
		updated_at: repo.updated_at,
		stargazers_count: repo.stargazers_count,
		language: repo.language,
	}));
	
	printOutput(simplified, { output: "table" });
}

export async function runRepoSelectCommand(owner?: string): Promise<{ owner: string; repo: string } | null> {
	const token = requireGitHubToken();
	const octokit = new Octokit({ auth: token });
	
	let repos: RepoInfo[];
	
	if (owner) {
		const { data } = await octokit.rest.repos.listForOrg({ org: owner, type: "all" });
		repos = data;
	} else {
		const { data } = await octokit.rest.repos.listForAuthenticatedUser({ type: "all" });
		repos = data;
	}
	
	// Use clack prompts for selection
	const { select } = await import("@clack/prompts");
	
	const selected = await select({
		message: owner ? `Select repository from ${owner}:` : "Select your repository:",
		options: repos.map((repo) => ({
			value: repo.full_name,
			label: `${repo.full_name} ${repo.description ? `- ${repo.description.slice(0, 60)}${repo.description.length > 60 ? "..." : ""}` : ""}`,
		})),
	});
	
	if (typeof selected === "symbol") return null;
	
	const [ownerName, repoName] = String(selected).split("/");
	return { owner: ownerName, repo: repoName };
}
