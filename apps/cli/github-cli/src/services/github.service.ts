import { Octokit } from "octokit";
import { envConfig } from "../config/env.config";

let octokit: Octokit | null = null;

function getOctokitClient(): Octokit {
	if (!envConfig.githubToken) {
		throw new Error(
			"GitHub token is not configured. Please add it to your .env file.",
		);
	}

	octokit ??= new Octokit({ auth: envConfig.githubToken });
	return octokit;
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
	const client = getOctokitClient();
	const { data } = await client.rest.repos.get({ owner, repo });
	return data.default_branch || "main";
}

async function getAuthenticatedUser() {
	const client = getOctokitClient();
	const { data } = await client.rest.users.getAuthenticated();
	return data;
}

export async function getRepoFiles(
	owner: string,
	repo: string,
): Promise<string[]> {
	try {
		const client = getOctokitClient();
		const branch = await getDefaultBranch(owner, repo);
		const { data } = await client.rest.git.getTree({
			owner,
			repo,
			tree_sha: branch,
			recursive: "1",
		});
		return data.tree
			.filter(
				(item: { type?: string; path?: string }) => item.type === "blob" && item.path,
			)
			.map((item: { path?: string }) => item.path as string);
	} catch (error) {
		console.error("Error fetching repo files:", error);
		return [];
	}
}

export async function commitAndPushFiles(
	owner: string,
	repo: string,
	files: { path: string; content: string }[],
	commitMessage: string,
) {
	try {
		const client = getOctokitClient();
		const user = await getAuthenticatedUser();
		const branch = await getDefaultBranch(owner, repo);

		const { data: refData } = await client.rest.git.getRef({
			owner,
			repo,
			ref: `heads/${branch}`,
		});

		const parentSha = refData.object.sha;

		const { data: parentCommit } = await client.rest.git.getCommit({
			owner,
			repo,
			commit_sha: parentSha,
		});

		const tree = await Promise.all(
			files.map(async (file) => {
				const { data } = await client.rest.git.createBlob({
					owner,
					repo,
					content: file.content,
					encoding: "utf-8",
				});
				return {
					path: file.path,
					mode: "100644" as const,
					type: "blob" as const,
					sha: data.sha,
				};
			}),
		);

		const { data: newTree } = await client.rest.git.createTree({
			owner,
			repo,
			tree,
			base_tree: parentCommit.tree.sha,
		});

		const { data: newCommit } = await client.rest.git.createCommit({
			owner,
			repo,
			message: commitMessage,
			tree: newTree.sha,
			parents: [parentSha],
			author: {
				name: user.name || "GitHub Sync CLI",
				email: user.email || "noreply@github.com",
			},
		});

		await client.rest.git.updateRef({
			owner,
			repo,
			ref: `heads/${branch}`,
			sha: newCommit.sha,
		});

		return newCommit.sha;
	} catch (error) {
		console.error("Error committing and pushing files:", error);
		throw error;
	}
}
