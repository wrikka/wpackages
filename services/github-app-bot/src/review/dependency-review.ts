import { fileURLToPath } from "node:url";
import type { AppEnv } from "../config/env";
import { defaultPolicyPath, readPolicy } from "../policy/policy";
import { summarizeWithLlm } from "../review/llm";

type PullFile = { filename?: string; status?: string; additions?: number; deletions?: number; changes?: number };

const getPolicyPath = (env: AppEnv): string => (env.policyPath ? env.policyPath : fileURLToPath(defaultPolicyPath));

const isPackageJson = (f: string) => f.endsWith("package.json");

export const buildDependencyReviewComment = async (args: {
	readonly env: AppEnv;
	readonly owner: string;
	readonly repo: string;
	readonly pullNumber: number;
	readonly changedFiles: unknown;
}): Promise<string | null> => {
	const files = Array.isArray((args.changedFiles as { files?: unknown }).files)
		? ((args.changedFiles as { files: PullFile[] }).files as PullFile[])
		: (Array.isArray(args.changedFiles) ? (args.changedFiles as PullFile[]) : []);

	const policy = readPolicy(getPolicyPath(args.env));
	const lockfiles = new Set(policy.lockfiles ?? []);

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

	const summary = await summarizeWithLlm({
		env: args.env,
		input: `PR changed dependency-related files:\n${depFiles.join("\n")}`,
	});

	const policyBody = [
		"",
		"### Policy",
		policy.engines ? `- engines: ${JSON.stringify(policy.engines)}` : "- engines: (not set)",
		policy.maxNewDependencies != null ? `- maxNewDependencies: ${policy.maxNewDependencies}` : "- maxNewDependencies: (not set)",
		foundBlocked ? "- blockedPackages: detected potential blocked changes" : "- blockedPackages: ok",
	].join("\n");

	return [baseBody, summary ? `\n### AI Summary\n${summary}` : "", policyBody].join("\n");
};
