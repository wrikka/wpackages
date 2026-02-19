export class BufferPool {
	private pool: Uint8Array[] = [];
	private bufferSize: number;
	private maxPoolSize: number;

	constructor(bufferSize: number = 4096, maxPoolSize: number = 100) {
		this.bufferSize = bufferSize;
		this.maxPoolSize = maxPoolSize;
	}

	acquire(): Uint8Array {
		if (this.pool.length > 0) {
			return this.pool.pop()!;
		}
		return new Uint8Array(this.bufferSize);
	}

	release(buffer: Uint8Array): void {
		if (buffer.length === this.bufferSize && this.pool.length < this.maxPoolSize) {
			buffer.fill(0);
			this.pool.push(buffer);
		}
	}

	clear(): void {
		this.pool = [];
	}

	get size(): number {
		return this.pool.length;
	}
}
