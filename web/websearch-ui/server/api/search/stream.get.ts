import { WebSearchApp } from "@wpackages/websearch";
import { Effect } from "effect";
import type { H3Event } from "h3";
import { defineEventHandler, getQuery, setHeader } from "h3";

type StreamEvent =
	| { type: "result"; at: string; payload: unknown }
	| { type: "error"; at: string; error: string }
	| { type: "ping"; at: string };

const createMockResult = (query: string) => ({
	query,
	enhancement: {
		originalQuery: query,
		enhancedQuery: query,
		suggestedQueries: [
			`${query} price`,
			`${query} specs`,
			`${query} review`,
			`${query} release date`,
			`${query} comparison`,
		],
	},
	results: [
		{
			title: `${query} — overview and key features (Mock)`,
			url: "https://en.wikipedia.org/wiki/Samsung_Galaxy",
			snippet:
				"Mock result: This item is generated to demo the workflow UI when engines are blocked or return empty results.",
			score: 0.86,
			engine: "mock",
			metadata: {},
		},
		{
			title: `${query} — latest announcements (Mock)`,
			url: "https://www.theverge.com/",
			snippet: "Mock result: For a real run, ensure outbound requests are allowed and search engines are reachable.",
			score: 0.78,
			engine: "mock",
			metadata: {},
		},
		{
			title: `${query} — buying guide (Mock)`,
			url: "https://www.gsmarena.com/",
			snippet: "Mock result: Generated content for UI demo. Use it to validate animation and layout.",
			score: 0.74,
			engine: "mock",
			metadata: {},
		},
	],
	summary: {
		summary:
			"Mock summary: This is a demo summary produced when real search results are unavailable. It validates the streaming workflow UX.",
		keyPoints: [
			"Progress events stream over SSE and update the workflow timeline.",
			"Results panel renders incrementally as soon as the final result payload arrives.",
			"Fallback mock keeps the demo usable even if engines are blocked.",
		],
		topics: ["mock", "workflow", "streaming"],
		confidence: 0.42,
	},
	clusters: [{ name: "mock", results: [], keywords: ["mock"] }],
	metadata: {
		totalResults: 3,
		enginesUsed: ["mock"],
		searchTime: 0,
		cached: false,
		mocked: true,
	},
});

export default defineEventHandler(async (event: H3Event) => {
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

		const results = (result as any)?.results;
		const isEmptyResults = !Array.isArray(results) || results.length === 0;
		const finalPayload = isEmptyResults ? createMockResult(query) : result;

		if (!closed) {
			write({ type: "result", at: new Date().toISOString(), payload: finalPayload } satisfies StreamEvent);
		}
	} catch {
		if (!closed) {
			write({ type: "result", at: new Date().toISOString(), payload: createMockResult(query) } satisfies StreamEvent);
		}
	} finally {
		clearInterval(pingInterval);
		res.end();
	}
});
