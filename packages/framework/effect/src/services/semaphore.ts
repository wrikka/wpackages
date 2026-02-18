import type { AcquireFailure, AcquireSuccess, Semaphore, SemaphoreAcquireResult, SemaphoreRelease } from "../types";
import type { Effect } from "../types";

class SemaphoreImpl implements Semaphore {
	readonly _tag = "Semaphore" as const;
	readonly permits: number;
	private currentAvailable: number;
	private waiters: { resolve: () => void; reject: (reason: Error) => void }[] = [];
	private isShutdown = false;

	constructor(permits: number) {
		this.permits = permits;
		this.currentAvailable = permits;
	}

	get available(): number {
		return this.currentAvailable;
	}

	get waiting(): number {
		return this.waiters.length;
	}

	async acquire(timeout?: number): Promise<AcquireSuccess | AcquireFailure> {
		if (this.isShutdown) {
			return { _tag: "AcquireFailure", reason: "shutdown" };
		}

		if (this.currentAvailable > 0) {
			this.currentAvailable--;
			return {
				_tag: "AcquireSuccess",
				release: () => this.release(),
			};
		}

		return new Promise((resolve, reject) => {
			const waiter = { resolve: () => resolve(this.doAcquire()), reject };
			this.waiters.push(waiter);

			if (timeout !== undefined && timeout > 0) {
				setTimeout(() => {
					const index = this.waiters.indexOf(waiter);
					if (index > -1) {
						this.waiters.splice(index, 1);
						resolve({ _tag: "AcquireFailure", reason: "timeout" });
					}
				}, timeout);
			}
		});
	}

	private doAcquire(): AcquireSuccess {
		this.currentAvailable--;
		return {
			_tag: "AcquireSuccess",
			release: () => this.release(),
		};
	}

	release(): SemaphoreRelease {
		if (this.currentAvailable < this.permits) {
			this.currentAvailable++;
		}

		if (this.waiters.length > 0) {
			const waiter = this.waiters.shift();
			if (waiter) {
				this.currentAvailable--;
				waiter.resolve();
			}
		}

		return { _tag: "SemaphoreRelease" };
	}

	shutdown(): void {
		this.isShutdown = true;
		for (const waiter of this.waiters) {
			waiter.reject(new Error("Semaphore shutdown"));
		}
		this.waiters = [];
	}
}

export const createSemaphore = (permits: number): Semaphore => {
	return new SemaphoreImpl(permits);
};

export const acquire = (
	semaphore: Semaphore,
	timeout?: number,
): Effect<SemaphoreAcquireResult> => {
	return async () => {
		const s = semaphore as SemaphoreImpl;
		return s.acquire(timeout);
	};
};

export const release = (semaphore: Semaphore): Effect<SemaphoreRelease> => {
	return () => {
		const s = semaphore as SemaphoreImpl;
		return Promise.resolve(s.release());
	};
};

export const withSemaphore = <A, E>(
	semaphore: Semaphore,
	effect: Effect<A, E>,
	timeout?: number,
): Effect<A, E | { _tag: "AcquireFailure"; reason: "timeout" | "shutdown" }> => {
	return async () => {
		const s = semaphore as SemaphoreImpl;
		const result = await s.acquire(timeout);

		if (result._tag === "AcquireFailure") {
			throw result;
		}

		try {
			return await effect();
		} finally {
			s.release();
		}
	};
};

export const available = (semaphore: Semaphore): Effect<number> => {
	return () => Promise.resolve(semaphore.available);
};

export const waitingCount = (semaphore: Semaphore): Effect<number> => {
	return () => Promise.resolve(semaphore.waiting);
};

export const shutdown = (semaphore: Semaphore): Effect<void> => {
	return () => {
		const s = semaphore as SemaphoreImpl;
		s.shutdown();
		return Promise.resolve();
	};
};
