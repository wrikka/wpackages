import * as Effect from "effect";
import { Layer, Context } from "effect";
import { createPrivateKey, createSign, randomUUID } from "node:crypto";
import type { GitHubService, GitHubError } from "../types";

export const GitHubService = Context.GenericTag<GitHubService>("GitHubService");

const base64ToPem = (b64: string): string => Buffer.from(b64, "base64").toString("utf8");

const base64Url = (input: Buffer): string =>
	input
		.toString("base64")
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replaceAll("=", "");

const signJwtRs256 = (args: { readonly pem: string; readonly payload: Record<string, unknown> }): string => {
	const header = { alg: "RS256", typ: "JWT", kid: randomUUID() };
	const encodedHeader = base64Url(Buffer.from(JSON.stringify(header)));
	const encodedPayload = base64Url(Buffer.from(JSON.stringify(args.payload)));
	const input = `${encodedHeader}.${encodedPayload}`;

	const key = createPrivateKey(args.pem);
	const signature = createSign("RSA-SHA256").update(input).sign(key);
	return `${input}.${base64Url(signature)}`;
};

const createAppJwt = (
	args: { readonly appId: string; readonly privateKeyPemBase64: string },
): Effect.Effect<string, GitHubError> =>
	Effect.sync(() => {
		const now = Math.floor(Date.now() / 1000);
		const pem = base64ToPem(args.privateKeyPemBase64);
		const payload = {
			iat: now - 30,
			exp: now + 9 * 60,
			iss: args.appId,
		};
		return signJwtRs256({ pem, payload });
	});

export const GitHubServiceLive = Effect.succeed<GitHubService>({
	getInstallationToken: (args) =>
		Effect.gen(function*() {
			const jwt = yield* createAppJwt({
				appId: args.appId,
				privateKeyPemBase64: args.privateKeyPemBase64,
			});

			const res = yield* Effect.tryPromise({
				try: () =>
					fetch(
						new URL(`/app/installations/${args.installationId}/access_tokens`, "https://api.github.com"),
						{
							method: "POST",
							headers: {
								Accept: "application/vnd.github+json",
								"User-Agent": "@wpackages/github-app-bot",
								Authorization: `Bearer ${jwt}`,
							},
						},
					),
				catch: (error) =>
					new GitHubError(
						`Failed to fetch installation token: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			if (!res.ok) {
				const body = yield* Effect.tryPromise({
					try: () => res.text(),
					catch: () => "",
				});
				return yield* Effect.fail(
					new GitHubError(
						`Failed to get installation token: ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`,
						res.status,
						res.statusText,
						body,
					),
				);
			}

			const json = yield* Effect.tryPromise({
				try: () => res.json() as Promise<{ token?: string }>,
				catch: (error) =>
					new GitHubError(
						`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			if (!json.token) {
				return yield* Effect.fail(new GitHubError("Missing installation token in response"));
			}

			return json.token;
		}),

	requestJson: <T>(args: { readonly token: string; readonly path: string; readonly init?: RequestInit }) =>
		Effect.gen(function*() {
			const res = yield* Effect.tryPromise({
				try: () =>
					fetch(new URL(args.path, "https://api.github.com"), {
						...args.init,
						headers: new Headers({
							Accept: "application/vnd.github+json",
							"User-Agent": "@wpackages/github-app-bot",
							Authorization: `Bearer ${args.token}`,
							...(args.init?.headers as Record<string, string>),
						}),
					}),
				catch: (error) =>
					new GitHubError(
						`GitHub request failed: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			if (!res.ok) {
				const body = yield* Effect.tryPromise({
					try: () => res.text(),
					catch: () => "",
				});
				return yield* Effect.fail(
					new GitHubError(
						`GitHub request failed: ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`,
						res.status,
						res.statusText,
						body,
					),
				);
			}

			return yield* Effect.tryPromise({
				try: () => res.json() as Promise<T>,
				catch: (error) =>
					new GitHubError(
						`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
					),
			});
		}),
});

export const GitHubServiceLayer = Layer.effect(GitHubService, GitHubServiceLive);
