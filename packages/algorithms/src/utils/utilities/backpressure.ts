export interface BackpressureOptions {
	highWaterMark?: number;
	lowWaterMark?: number;
}

export class BackpressureController {
	private queue: Array<() => void> = [];
	private highWaterMark: number;
	private lowWaterMark: number;
	private currentSize = 0;
	private paused = false;

	constructor(options: BackpressureOptions = {}) {
		this.highWaterMark = options.highWaterMark ?? 1000;
		this.lowWaterMark = options.lowWaterMark ?? 500;
	}

	async process<T>(item: T, processor: (item: T) => Promise<void>): Promise<void> {
		if (this.paused) {
			await this.wait();
		}

		this.currentSize++;
		this.checkBackpressure();

		try {
			await processor(item);
		} finally {
			this.currentSize--;
			this.checkResume();
		}
	}

	private checkBackpressure(): void {
		if (this.currentSize >= this.highWaterMark && !this.paused) {
			this.paused = true;
		}
	}

	private checkResume(): void {
		if (this.paused && this.currentSize <= this.lowWaterMark) {
			this.paused = false;
			this.notify();
		}
	}

	private wait(): Promise<void> {
		return new Promise((resolve) => {
			this.queue.push(resolve);
		});
	}

	private notify(): void {
		while (this.queue.length > 0 && !this.paused) {
			const resolve = this.queue.shift();
			resolve?.();
		}
	}

	get isPaused(): boolean {
		return this.paused;
	}

	get size(): number {
		return this.currentSize;
	}

	reset(): void {
		this.queue = [];
		this.currentSize = 0;
		this.paused = false;
	}
}

export async function processWithBackpressure<T>(
	items: T[],
	processor: (item: T) => Promise<void>,
	options: BackpressureOptions = {},
): Promise<void> {
	const controller = new BackpressureController(options);

	await Promise.all(items.map((item) => controller.process(item, processor)));
}
