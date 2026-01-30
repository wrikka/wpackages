import type { IncomingMessage, ServerResponse } from "node:http";
import type { AppEnv } from "../config/env";
import { handlePullRequestEvent } from "../handlers/pull-request";
import { readRawBody } from "./read-body";
import { verifyGitHubSignature } from "./verify";

export const handleWebhookRequest = async (args: {
	readonly env: AppEnv;
	readonly req: IncomingMessage;
	readonly res: ServerResponse;
}): Promise<void> => {
	const { env, req, res } = args;
	if ((req.method ?? "").toUpperCase() !== "POST") {
		res.statusCode = 405;
		res.end("Method Not Allowed");
		return;
	}

	const url = new URL(req.url ?? "", `http://localhost:${env.port}`);
	if (url.pathname !== env.webhookPath) {
		res.statusCode = 404;
		res.end("Not Found");
		return;
	}

	const rawBody = await readRawBody(req);
	const ok = verifyGitHubSignature({
		secret: env.webhookSecret,
		rawBody,
		signature256: req.headers["x-hub-signature-256"] as string | undefined,
	});

	if (!ok) {
		res.statusCode = 401;
		res.end("Invalid signature");
		return;
	}

	const event = req.headers["x-github-event"] as string | undefined;
	const payload = JSON.parse(Buffer.from(rawBody).toString("utf8")) as unknown;

	if (event === "pull_request") {
		await handlePullRequestEvent({ env, payload });
	}

	res.statusCode = 200;
	res.setHeader("content-type", "application/json");
	res.end(JSON.stringify({ ok: true }));
};
