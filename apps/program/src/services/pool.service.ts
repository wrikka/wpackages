/**
 * Pool - A generic, scoped, and concurrent resource pool.
 */

import { makeResource, type Resource } from "./resource.service";

interface PoolItem<A> {
	item: A;
	lastUsed: number;
}

export class Pool<A> {
	private readonly items: PoolItem<A>[] = [];
	private readonly pending: ((item: PoolItem<A>) => void)[] = [];
	private isShuttingDown = false;

	private constructor(
		private readonly resource: Resource<A>,
		private readonly min: number,
		private readonly max: number,

	) {}

	static make<A>(options: {
		resource: Resource<A>;
		min: number;
		max: number;
		tl?: number;
	}): Resource<Pool<A>> {
		const poolPromise = (async () => {
			const pool = new Pool(options.resource, options.min, options.max);
			await pool.initialize();
			return pool;
		})();

		return makeResource(
			poolPromise,
			(pool) => pool.shutdown(),
		);
	}

	private async initialize(): Promise<void> {
		for (let i = 0; i < this.min; i++) {
			const result = await this.resource.acquire;
			this.items.push({ item: result, lastUsed: Date.now() });
		}
	}

	async acquire(): Promise<A> {
		if (this.isShuttingDown) throw new Error("Pool is shutting down");

		// Try to get an idle item
		if (this.items.length > 0) {
			const poolItem = this.items.pop()!;
			return poolItem.item;
		}

		// If we can create more items
		if (this.items.length + this.pending.length < this.max) {
			const result = await this.resource.acquire;
			return result;
		}

		// Wait for an item to be released
		return new Promise(resolve => {
			this.pending.push(item => resolve(item.item));
		});
	}

	release(item: A): void {
		if (this.isShuttingDown) {
			this.resource.release(item, { _tag: "Success" }).catch(() => {});
			return;
		}

		const poolItem = { item, lastUsed: Date.now() };

		if (this.pending.length > 0) {
			const waiter = this.pending.shift()!;
			waiter(poolItem);
		} else {
			this.items.push(poolItem);
		}
	}

	async shutdown(): Promise<void> {
		this.isShuttingDown = true;
		const allItems = [...this.items];
		this.items.length = 0;

		const releasePromises = allItems.map(poolItem => this.resource.release(poolItem.item, { _tag: "Success" }));

		await Promise.all(releasePromises);

	}
}
