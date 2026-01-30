import { Cache } from "./cache";
import { Query } from "./query";
import { type CacheConfig, type DataLoader, type QueryKey, type QueryOptions, serializeQueryKey } from "./types";

export class QueryClient {
	private cache: Cache<unknown>;
	private queries: Map<string, Query<unknown>> = new Map();

	constructor(config: CacheConfig = {}) {
		this.cache = new Cache(config);
	}

	getQuery<T>(key: QueryKey): Query<T> | undefined {
		const serializedKey = serializeQueryKey(key);
		return this.queries.get(serializedKey) as Query<T> | undefined;
	}

	setQuery<T>(key: QueryKey, query: Query<T>): void {
		const serializedKey = serializeQueryKey(key);
		this.queries.set(serializedKey, query as Query<unknown>);
	}

	getCache(): Cache<unknown> {
		return this.cache;
	}

	fetchQuery<T>(
		key: QueryKey,
		fetcher: DataLoader<T>,
		options: QueryOptions<T> = {},
	): Query<T> {
		let query = this.getQuery<T>(key);
		if (query) {
			return query;
		}
		query = new Query<T>(this, key, fetcher, options);
		this.setQuery(key, query);
		return query;
	}

	invalidateQueries(key: QueryKey): void {
		// A simple prefix-based invalidation
		const keyPrefix = JSON.stringify(key).slice(0, -1);

		for (const [serializedQueryKey, query] of this.queries.entries()) {
			if (serializedQueryKey.startsWith(keyPrefix)) {
				query.invalidate();
			}
		}
	}

	setQueryData<T>(key: QueryKey, data: T): void {
		const query = this.getQuery<T>(key);
		if (query) {
			query.setData(data);
		} else {
			const serializedKey = serializeQueryKey(key);
			this.getCache().set(serializedKey, data);
		}
	}
}
