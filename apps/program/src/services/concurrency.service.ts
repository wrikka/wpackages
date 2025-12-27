/**
 * Concurrency - Simple concurrency primitives
 *
 * Ref, Semaphore ที่ใช้งานง่าย (Queue ย้ายไป concurrency)
 */

/**
 * Ref - Mutable reference with atomic operations
 */
export class Ref<T> {
	private value: T;
	private lock = new Lock();

	constructor(initialValue: T) {
		this.value = initialValue;
	}

	/**
	 * Get current value
	 */
	async get(): Promise<T> {
		return this.lock.run(async () => this.value);
	}

	/**
	 * Set new value
	 */
	async set(newValue: T): Promise<void> {
		await this.lock.run(async () => {
			this.value = newValue;
		});
	}

	/**
	 * Update value
	 */
	async update(fn: (current: T) => T): Promise<void> {
		await this.lock.run(async () => {
			this.value = fn(this.value);
		});
	}

	/**
	 * Get and update
	 */
	async getAndUpdate(fn: (current: T) => T): Promise<T> {
		return this.lock.run(async () => {
			const old = this.value;
			this.value = fn(this.value);
			return old;
		});
	}

	/**
	 * Update and get
	 */
	async updateAndGet(fn: (current: T) => T): Promise<T> {
		return this.lock.run(async () => {
			this.value = fn(this.value);
			return this.value;
		});
	}
}

/**
 * Semaphore - Concurrency limiter
 */
export class Semaphore {
	private permits: number;
	private readonly queue: Array<() => void> = [];

	constructor(permits: number) {
		this.permits = permits;
	}

	/**
	 * Acquire permit
	 */
	async acquire(): Promise<void> {
		if (this.permits > 0) {
			this.permits--;
			return;
		}

		await new Promise<void>((resolve) => {
			this.queue.push(resolve);
		});

		this.permits--;
	}

	/**
	 * Release permit
	 */
	release(): void {
		this.permits++;

		const next = this.queue.shift();
		if (next) {
			next();
		}
	}

	/**
	 * Try acquire (non-blocking)
	 */
	tryAcquire(): boolean {
		if (this.permits > 0) {
			this.permits--;
			return true;
		}
		return false;
	}

	/**
	 * Run with permit
	 */
	async with<T>(fn: () => Promise<T>): Promise<T> {
		await this.acquire();
		try {
			return await fn();
		} finally {
			this.release();
		}
	}

	/**
	 * Available permits
	 */
	available(): number {
		return this.permits;
	}
}

/**
 * Lock - Simple async lock
 */
class Lock {
	private locked = false;
	private queue: Array<() => void> = [];

	async run<T>(fn: () => Promise<T>): Promise<T> {
		while (this.locked) {
			await new Promise<void>((resolve) => {
				this.queue.push(resolve);
			});
		}

		this.locked = true;

		try {
			return await fn();
		} finally {
			this.locked = false;
			const next = this.queue.shift();
			if (next) {
				next();
			}
		}
	}
}

/**
 * Mutex - Alias for Lock
 */
export { Lock as Mutex };
