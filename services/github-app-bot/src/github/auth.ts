import { createPrivateKey, createSign, randomUUID } from "node:crypto";

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

const createAppJwt = async (args: { readonly appId: string; readonly privateKeyPemBase64: string }): Promise<string> => {
	const now = Math.floor(Date.now() / 1000);
	const pem = base64ToPem(args.privateKeyPemBase64);
	const payload = {
		iat: now - 30,
		exp: now + 9 * 60,
		iss: args.appId,
	};
	return signJwtRs256({ pem, payload });
};

export const getInstallationToken = async (args: {
	readonly appId: string;
	readonly installationId: string;
	readonly privateKeyPemBase64: string;
}): Promise<string> => {
	const jwt = await createAppJwt({ appId: args.appId, privateKeyPemBase64: args.privateKeyPemBase64 });
	const res = await fetch(new URL(`/app/installations/${args.installationId}/access_tokens`, "https://api.github.com"), {
		method: "POST",
		headers: {
			Accept: "application/vnd.github+json",
			"User-Agent": "@wpackages/github-app-bot",
			Authorization: `Bearer ${jwt}`,
		},
	});

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Failed to get installation token: ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`);
	}

	const json = (await res.json()) as { token?: string };
	if (!json.token) throw new Error("Missing installation token in response");
	return json.token;
};
