import { Effect as FunctionalEffect } from "@wts/functional";
import { Effect, Layer } from "@wts/functional";
import type { Effect as EffectType } from "@wts/functional";

type Json = unknown;

export interface GitHubRequestOptions {
	readonly token?: string;
	readonly baseUrl?: string;
	readonly userAgent?: string;
}

export interface GitHub {
	readonly requestJson: (path: string, init?: RequestInit) => EffectType<Json, Error, never>;
	readonly getRepo: (owner: string, repo: string) => EffectType<Json, Error, never>;
}

export const GitHub = FunctionalEffect.tag<GitHub>();

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

const buildHeaders = (
	opts: Required<Pick<GitHubRequestOptions, "userAgent">> & { readonly token?: string | undefined },
	init?: RequestInit,
): HeadersInit => {
	const initHeaders = init?.headers ?? {};
	return {
		Accept: "application/vnd.github+json",
		"User-Agent": opts.userAgent,
		...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
		...(typeof initHeaders === "object" ? initHeaders : {}),
	};
};

const defaultBaseUrl = "https://api.github.com";
const defaultUserAgent = "@wts/github";

export const makeGitHub = (options: GitHubRequestOptions = {}): GitHub => {
	const baseUrl = options.baseUrl ?? defaultBaseUrl;
	const token = options.token;
	const userAgent = options.userAgent ?? defaultUserAgent;

	const requestJson = (path: string, init?: RequestInit) =>
		Effect.mapError(
			Effect.fromPromise(async () => {
				const url = new URL(path, baseUrl);
				const res = await fetch(url, {
					...init,
					headers: buildHeaders({ userAgent, token }, init),
				});

				if (!res.ok) {
					const body = await res.text().catch(() => "");
					throw new Error(`GitHub request failed: ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`);
				}

				return res.json();
			}),
			toError,
		);

	return {
		requestJson,
		getRepo: (owner, repo) => requestJson(`/repos/${owner}/${repo}`),
	};
};

const envToken = process.env["GITHUB_TOKEN"];
export const GitHubLive = Layer.succeed(GitHub, makeGitHub(envToken ? { token: envToken } : {}));

export const requestJson = (path: string, init?: RequestInit) =>
	Effect.gen(function*() {
		const svc = yield Effect.get(GitHub);
		return yield svc.requestJson(path, init);
	});

export const getRepo = (owner: string, repo: string) =>
	Effect.gen(function*() {
		const svc = yield Effect.get(GitHub);
		return yield svc.getRepo(owner, repo);
	});
