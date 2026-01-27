import { Effect } from "effect";
import type { RouteParams } from "./routing";

export type MockRequestOptions = {
	readonly method: string;
	readonly url: string;
	readonly headers?: HeadersInit;
	readonly body?: unknown;
};

export const createMockRequest = (options: MockRequestOptions): Request => {
	const headers = new Headers(options.headers);

	if (options.body && typeof options.body === "object") {
		headers.set("Content-Type", "application/json");
	}

	return new Request(options.url, {
		method: options.method,
		headers,
		body: options.body ? JSON.stringify(options.body) : null,
	});
};

export const createMockResponse = (data: unknown, status = 200, headers?: HeadersInit): Response => {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	});
};

export const mockParams = (params: Record<string, string | number | boolean>): RouteParams => params;

export const waitFor = (ms: number): Effect.Effect<void> => Effect.sleep(`${ms} millis`);
