import { Effect } from "effect";
import { getQuery, setHeader, defineEventHandler } from "h3";
import { WebSearchApp } from "@wpackages/websearch";

type StreamEvent =
	| { type: "result"; at: string; payload: unknown }
	| { type: "error"; at: string; error: string }
	| { type: "ping"; at: string };

export default defineEventHandler(async (event) => {
	setHeader(event, "Content-Type", "text/event-stream; charset=utf-8");
	setHeader(event, "Cache-Control", "no-cache, no-transform");
	setHeader(event, "Connection", "keep-alive");

	const { q } = getQuery(event);
	const query = typeof q === "string" ? q : "";

	const res = event.node.res;
	res.flushHeaders?.();

	const write = (data: unknown) => {
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	};

	let closed = false;
	event.node.req.on("close", () => {
		closed = true;
	});

	const app = new WebSearchApp();

	const pingInterval = setInterval(() => {
		if (closed) return;
		write({ type: "ping", at: new Date().toISOString() } satisfies StreamEvent);
	}, 15000);

	try {
		if (!query.trim()) {
			write({ type: "error", at: new Date().toISOString(), error: "Missing query" } satisfies StreamEvent);
			res.end();
			return;
		}

		const result = await Effect.runPromise(
			app.searchWithProgress(query, {
				onProgress: (evt) => {
					if (closed) return;
					write(evt);
				},
			}),
		);

		if (!closed) {
			write({ type: "result", at: new Date().toISOString(), payload: result } satisfies StreamEvent);
		}
	} catch (error: unknown) {
		if (!closed) {
			write({
				type: "error",
				at: new Date().toISOString(),
				error: error instanceof Error ? error.message : String(error),
			} satisfies StreamEvent);
		}
	} finally {
		clearInterval(pingInterval);
		res.end();
	}
});
