import { createServer } from "node:http";
import { readEnv } from "./config/env";
import { handleWebhookRequest } from "./webhook/handler";

export const runApp = async (): Promise<void> => {
	const env = readEnv(process.env);

	const server = createServer(async (req, res) => {
		try {
			await handleWebhookRequest({ env, req, res });
		} catch (e) {
			res.statusCode = 500;
			res.setHeader("content-type", "application/json");
			res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
		}
	});

	await new Promise<void>((resolve) => {
		server.listen(env.port, () => resolve());
	});
};
