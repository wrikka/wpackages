import type { AppEnv } from "../config/env";
import { getInstallationToken } from "../github/auth";
import { githubRequestJson } from "../github/client";
import { buildDependencyReviewComment } from "../review/dependency-review";

type PullRequestPayload = {
	action?: string;
	repository?: { owner?: { login?: string }; name?: string };
	pull_request?: {
		number?: number;
		base?: { repo?: { owner?: { login?: string }; name?: string }; sha?: string };
		head?: { sha?: string };
	};
};

export const handlePullRequestEvent = async (
	args: { readonly env: AppEnv; readonly payload: unknown },
): Promise<void> => {
	const payload = args.payload as PullRequestPayload;
	const action = payload.action;
	if (action !== "opened" && action !== "synchronize" && action !== "reopened") return;

	const owner = payload.repository?.owner?.login;
	const repo = payload.repository?.name;
	const pullNumber = payload.pull_request?.number;
	const baseSha = payload.pull_request?.base?.sha;
	const headSha = payload.pull_request?.head?.sha;
	if (!owner || !repo || !pullNumber || !baseSha || !headSha) return;

	const token = await getInstallationToken({
		appId: args.env.githubAppId,
		installationId: args.env.githubInstallationId,
		privateKeyPemBase64: args.env.githubPrivateKeyPemBase64,
	});

	const files = await githubRequestJson({
		token,
		path: `/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`,
	});

	const comment = await buildDependencyReviewComment({
		token,
		env: args.env,
		owner,
		repo,
		pullNumber,
		baseSha,
		headSha,
		changedFiles: files,
	});

	if (!comment) return;

	await githubRequestJson({
		token,
		path: `/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
		init: {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ body: comment }),
		},
	});
};
