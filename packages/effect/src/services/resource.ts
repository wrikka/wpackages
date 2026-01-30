import type { Effect } from "../types";
import type { ScopedResource } from "../types/resource";

export const acquireRelease = <A, E>(
	acquire: Effect<A, E>,
	release: (resource: A) => Effect<void, E>,
): Effect<ScopedResource<A>, E> => {
	return async () => {
		const resource = await acquire();
		return {
			_tag: "ScopedResource",
			resource,
			release: async () => {
				await release(resource)();
			},
		};
	};
};

export const using = <A, B, E>(
	resource: Effect<ScopedResource<A>, E>,
	f: (resource: A) => Effect<B, E>,
): Effect<B, E> => {
	return async () => {
		const scoped = await resource();
		try {
			const result = await f(scoped.resource)();
			await scoped.release();
			return result;
		} catch (error) {
			try {
				await scoped.release();
			} catch {
				// ignore release failure on primary failure path
			}
			throw error;
		}
	};
};

export const pool = <A, E>(
	factory: () => Effect<A, E>,
	maxSize: number,
): Effect<ScopedResource<ResourcePool<A, E>>, E> => {
	return acquireRelease(
		async () => {
			const pool = new ResourcePool<A, E>(factory, maxSize);
			await pool.initialize();
			return pool;
		},
		(pool) => pool.dispose(),
	);
};

export class ResourcePool<A, E> {
	private available: A[] = [];
	private inUse = new Set<A>();

	constructor(
		private factory: () => Effect<A, E>,
		private maxSize: number,
	) {}

	async initialize(): Promise<void> {
		for (let i = 0; i < Math.min(5, this.maxSize); i++) {
			const resource = await this.factory()();
			this.available.push(resource);
		}
	}

	async acquire(): Promise<A> {
		if (this.available.length > 0) {
			const resource = this.available.pop()!;
			this.inUse.add(resource);
			return resource;
		}

		if (this.inUse.size < this.maxSize) {
			const resource = await this.factory()();
			this.inUse.add(resource);
			return resource;
		}

		throw new Error("Resource pool exhausted");
	}

	async release(resource: A): Promise<void> {
		if (this.inUse.has(resource)) {
			this.inUse.delete(resource);
			this.available.push(resource);
		}
	}

	async dispose(): Promise<void> {
		this.available = [];
		this.inUse.clear();
	}
}
