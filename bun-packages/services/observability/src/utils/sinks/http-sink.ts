import type { LogRecord } from "../logger";

export interface HttpSinkConfig {
	url: string;
	headers?: Record<string, string>;
	batchSize?: number;
	flushInterval?: number;
	timeout?: number;
	retries?: number;
}

class HttpSinkImpl {
	private config: HttpSinkConfig & {
		headers: Record<string, string>;
		batchSize: number;
		flushInterval: number;
		timeout: number;
		retries: number;
	};
	private buffer: LogRecord[] = [];
	private flushTimer: ReturnType<typeof setInterval> | null = null;

	constructor(config: HttpSinkConfig) {
		this.config = {
			batchSize: 100,
			flushInterval: 5000,
			timeout: 5000,
			retries: 3,
			headers: {},
			...config,
		};
		this.startFlushTimer();
	}

	write(record: LogRecord): void {
		this.buffer.push(record);

		if (this.buffer.length >= this.config.batchSize) {
			void this.flush();
		}
	}

	private startFlushTimer(): void {
		this.flushTimer = setInterval(() => {
			void this.flush();
		}, this.config.flushInterval);
	}

	private async flush(): Promise<void> {
		if (this.buffer.length === 0) {
			return;
		}

		const batch = this.buffer.splice(0, this.buffer.length);
		await this.sendBatch(batch);
	}

	private async sendBatch(batch: LogRecord[]): Promise<void> {
		let attempt = 0;

		while (attempt <= this.config.retries) {
			try {
				const response = await fetch(this.config.url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...this.config.headers,
					},
					body: JSON.stringify(batch),
					signal: AbortSignal.timeout(this.config.timeout),
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				return;
			} catch (error) {
				attempt++;
				if (attempt > this.config.retries) {
					console.error("Failed to send logs:", error);
					return;
				}
				await this.sleep(1000 * attempt);
			}
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async shutdown(): Promise<void> {
		if (this.flushTimer) {
			clearInterval(this.flushTimer);
			this.flushTimer = null;
		}
		await this.flush();
	}
}

export function createHttpSink(config: HttpSinkConfig): (record: LogRecord) => void {
	const sink = new HttpSinkImpl(config);
	return (record) => sink.write(record);
}
