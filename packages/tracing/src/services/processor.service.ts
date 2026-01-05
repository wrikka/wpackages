import type { BatchSpanProcessorConfig, Span, SpanExporter, SpanProcessor } from "../types/tracing";

const DEFAULT_MAX_QUEUE_SIZE = 2048;
const DEFAULT_MAX_EXPORT_BATCH_SIZE = 512;
const DEFAULT_SCHEDULED_DELAY_MILLIS = 5000;
const DEFAULT_EXPORT_TIMEOUT_MILLIS = 30000;

export class BatchSpanProcessor implements SpanProcessor {
	private readonly _exporter: SpanExporter;
	private readonly _maxQueueSize: number;
	private readonly _maxExportBatchSize: number;
	private readonly _scheduledDelayMillis: number;
	private readonly _exportTimeoutMillis: number;

	private _queue: Span[] = [];
	private _timer: ReturnType<typeof setTimeout> | undefined;
	private _shutdown = false;

	constructor(exporter: SpanExporter, config: BatchSpanProcessorConfig = {}) {
		this._exporter = exporter;
		this._maxQueueSize = config.maxQueueSize ?? DEFAULT_MAX_QUEUE_SIZE;
		this._maxExportBatchSize = config.maxExportBatchSize ?? DEFAULT_MAX_EXPORT_BATCH_SIZE;
		this._scheduledDelayMillis = config.scheduledDelayMillis ?? DEFAULT_SCHEDULED_DELAY_MILLIS;
		this._exportTimeoutMillis = config.exportTimeoutMillis ?? DEFAULT_EXPORT_TIMEOUT_MILLIS;
	}

	onStart(_span: Span): void {}

	onEnd(span: Span): void {
		if (this._shutdown) {
			return;
		}
		if (this._queue.length >= this._maxQueueSize) {
			return; // Drop span
		}
		this._queue.push(span);
		this._ensureTimer();
	}

	private _ensureTimer(): void {
		if (this._timer) return;
		this._timer = setTimeout(() => {
			void this._flush().catch((error) => {
				console.error("Failed to flush spans:", error);
			});
			this._timer = undefined;
		}, this._scheduledDelayMillis);
	}

	private async _flush(): Promise<void> {
		if (this._queue.length === 0) {
			return;
		}

		const batch = this._queue.splice(0, this._maxExportBatchSize);
		const timeoutPromise = new Promise((_, reject) => 
			setTimeout(() => reject(new Error('Export timed out')), this._exportTimeoutMillis)
		);

		try {
			await Promise.race([this._exporter.export(batch), timeoutPromise]);
		} catch (error) {
			console.error('Failed to export spans:', error);
		}
	}

	async shutdown(): Promise<void> {
		if (this._shutdown) {
			return;
		}
		this._shutdown = true;
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = undefined;
		}
		await this._flush();
		await this._exporter.shutdown();
	}
}

/**
 * A simple SpanProcessor that forwards spans to an exporter as soon as they end.
 */
export class SimpleSpanProcessor implements SpanProcessor {
	private readonly exporter: SpanExporter;

	constructor(exporter: SpanExporter) {
		this.exporter = exporter;
	}

	onStart(_span: Span): void {
		// This processor does nothing when a span starts
	}

	onEnd(span: Span): void {
		// Immediately export the span
		this.exporter.export([span]).catch((error) => {
			console.error("Failed to export span:", error);
		});
	}

	shutdown(): Promise<void> {
		return this.exporter.shutdown();
	}
}
