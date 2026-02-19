export class ProducerConsumer<T> {
	private buffer: T[] = [];
	private maxSize: number;
	private producers: number = 0;
	private consumers: number = 0;

	constructor(maxSize: number) {
		this.maxSize = maxSize;
	}

	async produce(item: T): Promise<void> {
		while (this.buffer.length >= this.maxSize) {
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		this.buffer.push(item);
		this.producers++;
	}

	async consume(): Promise<T | undefined> {
		while (this.buffer.length === 0) {
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		const item = this.buffer.shift();
		this.consumers++;
		return item;
	}

	getBuffer(): T[] {
		return [...this.buffer];
	}

	getStats(): { produced: number; consumed: number } {
		return { produced: this.producers, consumed: this.consumers };
	}
}
