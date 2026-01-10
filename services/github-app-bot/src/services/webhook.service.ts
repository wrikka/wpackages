import * as Effect from "effect";
import { Layer, Context } from "effect";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookService } from "../types";
import { WebhookError } from "../types";

export const WebhookService = Context.GenericTag<WebhookService>("WebhookService");

export const WebhookServiceLive = Effect.succeed<WebhookService>({
	verifySignature: (args) =>
		Effect.sync(() => {
			const header = args.signature256;
			if (!header || !header.startsWith("sha256=")) {
				return false;
			}

			const expected = createHmac("sha256", args.secret).update(args.rawBody).digest("hex");
			const actual = header.slice("sha256=".length);
			if (expected.length !== actual.length) {
				return false;
			}
			return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(actual, "utf8"));
		}),

	readBody: (req) =>
		Effect.tryPromise({
			try: () =>
				new Promise<Uint8Array>((resolve, reject) => {
					const chunks: Buffer[] = [];
					req.on("data", (chunk: Buffer) => chunks.push(chunk));
					req.on("end", () => resolve(Buffer.concat(chunks)));
					req.on("error", (error) => reject(error));
				}),
			catch: (error) =>
				new WebhookError(
					`Failed to read request body: ${error instanceof Error ? error.message : String(error)}`,
				),
		}),
});

export const WebhookServiceLayer = Layer.effect(WebhookService, WebhookServiceLive);
