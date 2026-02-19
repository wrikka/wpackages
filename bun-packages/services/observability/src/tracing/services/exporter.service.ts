import type { Span, SpanExporter } from "../types/tracing";

const DEFAULT_UI_URL = "http://localhost:5555/v1/traces";

const uiUrlFromEnv =
	(typeof process !== "undefined" && process.env && typeof process.env["WPACKAGES_TRACING_UI_URL"] === "string")
		? process.env["WPACKAGES_TRACING_UI_URL"]
		: undefined;

/**
 * A SpanExporter that sends spans to a local web UI for visualization.
 */
export class WebUiExporter implements SpanExporter {
	private readonly _url: string;

	constructor(url: string = uiUrlFromEnv ?? DEFAULT_UI_URL) {
		this._url = url;
	}

	async export(spans: Span[]): Promise<void> {
		try {
			await fetch(this._url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(spans),
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`WebUiExporter failed to send spans: ${message}`);
		}
	}

	shutdown(): Promise<void> {
		// Nothing to do for a stateless exporter
		return Promise.resolve();
	}
}

/**
 * A SpanExporter that stores spans in memory.
 * This is useful for testing and debugging.
 */
export class InMemorySpanExporter implements SpanExporter {
	private _finishedSpans: Span[] = [];

	export(spans: Span[]): Promise<void> {
		this._finishedSpans.push(...spans);
		return Promise.resolve();
	}

	shutdown(): Promise<void> {
		this.reset();
		return Promise.resolve();
	}

	/**
	 * Gets the list of finished spans.
	 */
	getFinishedSpans(): Span[] {
		return this._finishedSpans;
	}

	/**
	 * Resets the internal list of finished spans.
	 */
	reset(): void {
		this._finishedSpans.length = 0;
	}
}

/**
 * A simple SpanExporter that logs spans to the console.
 * This is useful for debugging and development purposes.
 */
export class ConsoleSpanExporter implements SpanExporter {
	export(spans: Span[]): Promise<void> {
		for (const span of spans) {
			console.log({
				traceId: span.traceId,
				spanId: span.spanId,
				parentId: span.parentId,
				name: span.name,
				duration: (span.endTime ?? 0) - span.startTime,
				status: span.status,
				attributes: span.attributes,
				events: span.events,
			});
		}
		return Promise.resolve();
	}

	shutdown(): Promise<void> {
		// Nothing to do for the console exporter
		return Promise.resolve();
	}
}
