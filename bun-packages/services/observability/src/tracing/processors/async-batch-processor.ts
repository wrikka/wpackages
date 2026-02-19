import type { Span, SpanProcessor } from "../types/tracing";

export interface AsyncBatchProcessorConfig {
	maxQueueSize: number;
	maxExportBatchSize: number;
	scheduledDelayMillis: number;
	exportTimeoutMillis: number;
}

export class AsyncBatchProcessor implements SpanProcessor {
	private config: AsyncBatchProcessorConfig;
	private queue: Span[] = [];
	private flushTimer: ReturnType<typeof setTimeout> | null = null;
	private isShutdown = false;

	constructor(
		config: Partial<AsyncBatchProcessorConfig> | undefined,
		private exporter: (spans: Span[]) => Promise<void>,
	) {
		this.config = {
			maxQueueSize: 2048,
			maxExportBatchSize: 512,
			scheduledDelayMillis: 5000,
			exportTimeoutMillis: 30000,
			...config,
		};
		this.startFlushTimer();
	}

	onStart(_span: Span): void {}

	onEnd(span: Span): void {
		if (this.isShutdown) {
			return;
		}

		if (this.queue.length >= this.config.maxQueueSize) {
			this.queue.shift();
		}

		this.queue.push(span);

		if (this.queue.length >= this.config.maxExportBatchSize) {
			this.flush();
		}
	}

	async shutdown(): Promise<void> {
		this.isShutdown = true;

		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
			this.flushTimer = null;
		}

		await this.flush();
	}

	private startFlushTimer(): void {
		this.scheduleFlush();
	}

	private scheduleFlush(): void {
		this.flushTimer = setTimeout(() => {
			this.flush().finally(() => {
				if (!this.isShutdown) {
					this.scheduleFlush();
				}
			});
		}, this.config.scheduledDelayMillis);
	}

	private async flush(): Promise<void> {
		if (this.queue.length === 0) {
			return;
		}

		const batch = this.queue.splice(0, this.config.maxExportBatchSize);

		try {
			await Promise.race([
				this.exporter(batch),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error("Export timeout")), this.config.exportTimeoutMillis)
				),
			]);
		} catch (error) {
			console.error("Failed to export spans:", error);
			this.queue.unshift(...batch);
		}
	}

	getQueueSize(): number {
		return this.queue.length;
	}
}

export function createAsyncBatchProcessor(
	exporter: (spans: Span[]) => Promise<void>,
	config?: Partial<AsyncBatchProcessorConfig>,
): AsyncBatchProcessor {
	return new AsyncBatchProcessor(config, exporter);
}
