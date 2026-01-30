import type { IncomingMessage } from "node:http";
import * as Effect from "effect";

export interface GitHubService {
	readonly getInstallationToken: (args: {
		readonly appId: string;
		readonly installationId: string;
		readonly privateKeyPemBase64: string;
	}) => Effect.Effect<string, GitHubError>;
	readonly requestJson: <T>(args: {
		readonly token: string;
		readonly path: string;
		readonly init?: RequestInit;
	}) => Effect.Effect<T, GitHubError>;
}

export class GitHubError {
	readonly _tag = "GitHubError";
	constructor(
		readonly message: string,
		readonly status?: number,
		readonly statusText?: string,
		readonly body?: string,
	) {}
}

export interface WebhookService {
	readonly verifySignature: (args: {
		readonly secret: string;
		readonly rawBody: Uint8Array;
		readonly signature256: string | undefined;
	}) => Effect.Effect<boolean>;
	readonly readBody: (req: IncomingMessage) => Effect.Effect<Uint8Array, WebhookError>;
}

export class WebhookError {
	readonly _tag = "WebhookError";
	constructor(readonly message: string) {}
}

export interface PolicyService {
	readonly readPolicy: (path: string) => Effect.Effect<Policy, PolicyError>;
	readonly validatePolicy: (policy: Policy) => Effect.Effect<void, PolicyError>;
}

export class PolicyError {
	readonly _tag = "PolicyError";
	constructor(readonly message: string) {}
}

export interface ReviewService {
	readonly compareDependencies: (args: {
		readonly token: string;
		readonly owner: string;
		readonly repo: string;
		readonly path: string;
		readonly baseSha: string;
		readonly headSha: string;
	}) => Effect.Effect<DependencyDiff, ReviewError>;
	readonly buildComment: (args: {
		readonly env: AppEnv;
		readonly owner: string;
		readonly repo: string;
		readonly pullNumber: number;
		readonly baseSha: string;
		readonly headSha: string;
		readonly changedFiles: unknown;
	}) => Effect.Effect<string | null, ReviewError>;
	readonly summarizeWithLlm: (args: {
		readonly env: AppEnv;
		readonly input: string;
	}) => Effect.Effect<string | null, ReviewError>;
}

export class ReviewError {
	readonly _tag = "ReviewError";
	constructor(readonly message: string) {}
}

export interface Policy {
	readonly engines?: Record<string, string>;
	readonly blockedPackages?: readonly string[];
	readonly allowedPackagePatterns?: readonly string[];
	readonly lockfiles?: readonly string[];
	readonly maxNewDependencies?: number;
}

export interface DependencyDiff {
	readonly added: Record<string, string>;
	readonly removed: Record<string, string>;
	readonly changed: Record<string, { readonly from: string; readonly to: string }>;
}

export interface AppEnv {
	readonly port: number;
	readonly webhookPath: string;
	readonly webhookSecret: string;
	readonly githubAppId: string;
	readonly githubInstallationId: string;
	readonly githubPrivateKeyPemBase64: string;
	readonly policyPath?: string;
	readonly llmBaseUrl?: string;
	readonly llmApiKey?: string;
	readonly llmModel?: string;
}
