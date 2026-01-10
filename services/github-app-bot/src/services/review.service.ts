import * as Effect from "effect";
import { Layer, Context } from "effect";
import { fileURLToPath } from "node:url";
import type { ReviewService, ReviewError, DependencyDiff, AppEnv } from "../types";
import { GitHubService } from "./github.service";
import { PolicyService } from "./policy.service";

export const ReviewService = Context.GenericTag<ReviewService>("ReviewService");

const getFileContent = (args: {
	token: string;
	owner: string;
	repo: string;
	path: string;
	ref: string;
}): Effect.Effect<string | null, ReviewError, GitHubService> =>
	Effect.gen(function*() {
		const github = yield* GitHubService;
		try {
			const response = yield* github.requestJson<{ content?: string }>({
				token: args.token,
				path: `/repos/${args.owner}/${args.repo}/contents/${args.path}?ref=${args.ref}`,
			});
			if (!response.content) return null;
			return Buffer.from(response.content, "base64").toString("utf8");
		} catch (error) {
			return null;
		}
	});

type Dependencies = Record<string, string>;

const parseDependencies = (content: string | null): Dependencies => {
	if (!content) return {};
	try {
		const json = JSON.parse(content);
		return {
			...json.dependencies,
			...json.devDependencies,
			...json.peerDependencies,
		};
	} catch {
		return {};
	}
};

const comparePackageJson = (args: {
	token: string;
	owner: string;
	repo: string;
	path: string;
	baseSha: string;
	headSha: string;
}): Effect.Effect<DependencyDiff, ReviewError, GitHubService> =>
	Effect.gen(function*() {
		const [baseContent, headContent] = yield* Effect.all([
			getFileContent({ ...args, ref: args.baseSha, path: args.path }),
			getFileContent({ ...args, ref: args.headSha, path: args.path }),
		]);

		const baseDeps = parseDependencies(baseContent);
		const headDeps = parseDependencies(headContent);

		const allKeys = [...new Set([...Object.keys(baseDeps), ...Object.keys(headDeps)])];

		const added: Dependencies = {};
		const removed: Dependencies = {};
		const changed: Record<string, { from: string; to: string }> = {};

		for (const key of allKeys) {
			const baseVersion = baseDeps[key];
			const headVersion = headDeps[key];

			if (!baseVersion && headVersion) {
				added[key] = headVersion;
			} else if (baseVersion && !headVersion) {
				removed[key] = baseVersion;
			} else if (baseVersion && headVersion && baseVersion !== headVersion) {
				changed[key] = { from: baseVersion, to: headVersion };
			}
		}

		return { added, removed, changed };
	});

const summarizeWithLlm = (args: {
	readonly env: AppEnv;
	readonly input: string;
}): Effect.Effect<string | null, ReviewError> =>
	Effect.gen(function*() {
		const baseUrl = args.env.llmBaseUrl;
		const apiKey = args.env.llmApiKey;
		const model = args.env.llmModel;
		if (!baseUrl || !apiKey || !model) return null;

		const url = new URL("/chat/completions", baseUrl);
		const res = yield* Effect.tryPromise({
			try: () =>
				fetch(url, {
					method: "POST",
					headers: {
						"content-type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify({
						model,
						messages: [
							{
								role: "system",
								content: "Summarize dependency/version changes for a code reviewer. Keep it concise.",
							},
							{ role: "user", content: args.input },
						],
						temperature: 0.2,
					}),
				}),
			catch: (error) =>
				new ReviewError(
					`LLM request failed: ${error instanceof Error ? error.message : String(error)}`,
				),
		});

		if (!res.ok) return null;

		const json = yield* Effect.tryPromise({
			try: () =>
				res.json() as Promise<{
					choices?: Array<{ message?: { content?: string } }>;
				}>,
			catch: (error) =>
				new ReviewError(
					`Failed to parse LLM response: ${error instanceof Error ? error.message : String(error)}`,
				),
		});

		const content = json.choices?.[0]?.message?.content;
		return content && content.trim().length > 0 ? content.trim() : null;
	});

type PullFile = {
	readonly filename?: string;
	readonly status?: string;
	readonly additions?: number;
	readonly deletions?: number;
	readonly changes?: number;
};

const buildComment = (args: {
	readonly env: AppEnv;
	readonly owner: string;
	readonly repo: string;
	readonly pullNumber: number;
	readonly baseSha: string;
	readonly headSha: string;
	readonly changedFiles: unknown;
}): Effect.Effect<string | null, ReviewError, GitHubService | PolicyService> =>
	Effect.gen(function*() {
		const github = yield* GitHubService;
		const policyService = yield* PolicyService;

		const files = Array.isArray((args.changedFiles as { files?: unknown }).files)
			? ((args.changedFiles as { files: PullFile[] }).files as PullFile[])
			: Array.isArray(args.changedFiles)
				? (args.changedFiles as PullFile[])
				: [];

		const policy = yield* policyService.readPolicy(
			args.env.policyPath ? args.env.policyPath : fileURLToPath(new URL("../../policy.json", import.meta.url)),
		);
		yield* policyService.validatePolicy(policy);

		const lockfiles = new Set(policy.lockfiles ?? []);

		const isPackageJson = (f: string) => f.endsWith("package.json");

		const depFiles = files
			.map((f) => f.filename)
			.filter((f): f is string => typeof f === "string")
			.filter((f) => isPackageJson(f) || lockfiles.has(f.split("/").at(-1) ?? f));

		if (depFiles.length === 0) return null;

		const blocked = new Set(policy.blockedPackages ?? []);
		const foundBlocked = depFiles.some((f) => blocked.has(f));

		const baseBody = [
			"## Dependency / Version Review",
			"",
			"### Files",
			...depFiles.map((f) => `- ${f}`),
		].join("\n");

		const summary = yield* summarizeWithLlm({
			env: args.env,
			input: `PR changed dependency-related files:\n${depFiles.join("\n")}`,
		});

		const policyBody = [
			"",
			"### Policy",
			policy.engines ? `- engines: ${JSON.stringify(policy.engines)}` : "- engines: (not set)",
			policy.maxNewDependencies != null
				? `- maxNewDependencies: ${policy.maxNewDependencies}`
				: "- maxNewDependencies: (not set)",
			foundBlocked ? "- blockedPackages: detected potential blocked changes" : "- blockedPackages: ok",
		].join("\n");

		return [baseBody, summary ? `\n### AI Summary\n${summary}` : "", policyBody].join("\n");
	});

export const ReviewServiceLive = Effect.succeed<ReviewService>({
	compareDependencies: comparePackageJson,
	buildComment: buildComment,
	summarizeWithLlm,
});

export const ReviewServiceLayer = Layer.effect(ReviewService, ReviewServiceLive);
