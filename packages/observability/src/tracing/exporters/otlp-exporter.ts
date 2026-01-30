import type { Span } from "../types/tracing";
import type { SpanExporter } from "../types/tracing";
import type {
	OtlpAnyValue,
	OtlpExporterConfig,
	OtlpExportSpansRequest,
	OtlpInstrumentationLibrary,
	OtlpKeyValue,
	OtlpResource,
	OtlpResourceSpans,
	OtlpSpan,
	OtlpSpanEvent,
	OtlpSpanKind,
	OtlpSpanLink,
	OtlpStatusCode,
} from "./otlp-types";

const DEFAULT_CONFIG: Partial<OtlpExporterConfig> = {
	timeout: 5000,
	maxRetries: 3,
	retryDelay: 1000,
	compression: "gzip",
	batchSize: 100,
};

export class OTLPSpanExporter implements SpanExporter {
	private config: Required<OtlpExporterConfig>;
	private resource: OtlpResource;
	private instrumentationLibrary: OtlpInstrumentationLibrary;
	private isShutdown = false;

	constructor(config: OtlpExporterConfig, resource: OtlpResource, instrumentationLibrary?: OtlpInstrumentationLibrary) {
		this.config = { ...DEFAULT_CONFIG, ...config } as Required<OtlpExporterConfig>;
		this.resource = resource;
		this.instrumentationLibrary = instrumentationLibrary || {
			name: "@wpackages/observability",
			version: "0.1.0",
		};
	}

	async export(spans: Span[]): Promise<void> {
		if (this.isShutdown) {
			return;
		}

		if (spans.length === 0) {
			return;
		}

		const otlpSpans = spans.map((span) => this.convertSpanToOtlp(span));
		const resourceSpans: OtlpResourceSpans = {
			resource: this.resource,
			instrumentationLibrarySpans: [
				{
					instrumentationLibrary: this.instrumentationLibrary,
					spans: otlpSpans,
				},
			],
		};

		const request: OtlpExportSpansRequest = {
			resourceSpans: [resourceSpans],
		};

		await this.sendRequest(request);
	}

	async shutdown(): Promise<void> {
		this.isShutdown = true;
	}

	private convertSpanToOtlp(span: Span): OtlpSpan {
		const kind = this.mapSpanKind(span);
		const status = this.mapSpanStatus(span);

		return {
			traceId: span.traceId,
			spanId: span.spanId,
			parentSpanId: span.parentId,
			name: span.name,
			kind,
			startTimeUnixNano: this.toNano(span.startTime),
			endTimeUnixNano: span.endTime ? this.toNano(span.endTime) : this.toNano(Date.now()),
			attributes: this.convertAttributes(span.attributes),
			events: span.events.map((event) => this.convertEvent(event)),
			links: span.links.map((link) => this.convertLink(link)),
			status,
			resource: this.resource,
			instrumentationLibrary: this.instrumentationLibrary,
		};
	}

	private mapSpanKind(_span: Span): OtlpSpanKind {
		return "SPAN_KIND_INTERNAL";
	}

	private mapSpanStatus(span: Span): { code: OtlpStatusCode; message?: string } {
		const codeMap: Record<string, OtlpStatusCode> = {
			unset: "UNSET",
			ok: "OK",
			error: "ERROR",
		};
		return {
			code: codeMap[span.status] || "UNSET",
		};
	}

	private convertAttributes(attributes: Record<string, unknown>): OtlpKeyValue[] {
		return Object.entries(attributes).map(([key, value]) => ({
			key,
			value: this.convertValue(value),
		}));
	}

	private convertValue(value: unknown): OtlpAnyValue {
		if (value === null || value === undefined) {
			return {};
		}

		switch (typeof value) {
			case "string":
				return { stringValue: value };
			case "number":
				return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
			case "boolean":
				return { boolValue: value };
			case "object":
				if (Array.isArray(value)) {
					return { arrayValue: { values: value.map((v) => this.convertValue(v)) } };
				}
				return {
					kvlistValue: {
						values: Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
							key: k,
							value: this.convertValue(v),
						})),
					},
				};
			default:
				return { stringValue: String(value) };
		}
	}

	private convertEvent(event: { name: string; time: number; attributes?: Record<string, unknown> }): OtlpSpanEvent {
		return {
			timeUnixNano: this.toNano(event.time),
			name: event.name,
			attributes: event.attributes ? this.convertAttributes(event.attributes) : undefined,
		};
	}

	private convertLink(
		link: { context: { traceId: string; spanId: string }; attributes?: Record<string, unknown> },
	): OtlpSpanLink {
		return {
			traceId: link.context.traceId,
			spanId: link.context.spanId,
			attributes: link.attributes ? this.convertAttributes(link.attributes) : undefined,
		};
	}

	private toNano(timestamp: number): string {
		return `${BigInt(timestamp) * 1000000n}`;
	}

	private async sendRequest(request: OtlpExportSpansRequest): Promise<void> {
		let attempt = 0;
		let lastError: Error | null = null;

		while (attempt <= this.config.maxRetries) {
			try {
				await this.doSendRequest(request);
				return;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				attempt++;

				if (attempt <= this.config.maxRetries) {
					const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
					await this.sleep(delay);
				}
			}
		}

		throw new Error(`OTLP export failed after ${this.config.maxRetries} retries: ${lastError?.message}`);
	}

	private async doSendRequest(request: OtlpExportSpansRequest): Promise<void> {
		const headers: Record<string, string> = {
			"Content-Type": "application/x-protobuf",
			...this.config.headers,
		};

		if (this.config.compression === "gzip") {
			headers["Content-Encoding"] = "gzip";
		}

		const body = JSON.stringify(request);

		const response = await fetch(this.config.url, {
			method: "POST",
			headers,
			body,
			signal: AbortSignal.timeout(this.config.timeout),
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`OTLP export failed: ${response.status} ${response.statusText} - ${text}`);
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

export function createOTLPSpanExporter(
	config: OtlpExporterConfig,
	resource: OtlpResource,
	instrumentationLibrary?: OtlpInstrumentationLibrary,
): OTLPSpanExporter {
	return new OTLPSpanExporter(config, resource, instrumentationLibrary);
}
