import type { AppEnv } from "../config/env";
import { getInstallationToken } from "../github/auth";
import { githubRequestJson } from "../github/client";
import { buildDependencyReviewComment } from "../review/dependency-review";

type PullRequestPayload = {
	action?: string;
	repository?: { owner?: { login?: string }; name?: string };
	pull_request?: { number?: number; base?: { repo?: { owner?: { login?: string }; name?: string } } };
};

export const handlePullRequestEvent = async (args: { readonly env: AppEnv; readonly payload: unknown }): Promise<void> => {
	const payload = args.payload as PullRequestPayload;
	const action = payload.action;
	if (action !== "opened" && action !== "synchronize" && action !== "reopened") return;

	const owner = payload.repository?.owner?.login;
	const repo = payload.repository?.name;
	const pullNumber = payload.pull_request?.number;
	if (!owner || !repo || !pullNumber) return;

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
		env: args.env,
		owner,
		repo,
		pullNumber,
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
