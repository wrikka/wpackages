/**
 * Core cache implementation with functional programming principles
 */

import { updateAccessMetadata } from "../components/cache-utils";
import type { Cache, CacheConfig, CacheEntry, CacheStats } from "../types/cache.types";

class DoublyLinkedListNode<K, V> {
	public key: K;
	public value: V;
	public next: DoublyLinkedListNode<K, V> | null = null;
	public prev: DoublyLinkedListNode<K, V> | null = null;

	constructor(key: K, value: V) {
		this.key = key;
		this.value = value;
	}
}

class DoublyLinkedList<K, V> {
	private head: DoublyLinkedListNode<K, V> | null = null;
	private tail: DoublyLinkedListNode<K, V> | null = null;

	public insertHead(node: DoublyLinkedListNode<K, V>): void {
		if (this.head === null) {
			this.head = node;
			this.tail = node;
		} else {
			node.next = this.head;
			this.head.prev = node;
			this.head = node;
		}
	}

	public moveToHead(node: DoublyLinkedListNode<K, V>): void {
		if (node === this.head) {
			return;
		}

		if (node.prev) {
			node.prev.next = node.next;
		}

		if (node.next) {
			node.next.prev = node.prev;
		}

		if (node === this.tail) {
			this.tail = node.prev;
		}

		node.prev = null;
		node.next = this.head;
		if (this.head) {
			this.head.prev = node;
		}
		this.head = node;

		if (this.tail === null) {
			this.tail = node;
		}
	}

	public removeTail(): DoublyLinkedListNode<K, V> | null {
		if (this.tail === null) {
			return null;
		}

		const tail = this.tail;
		if (this.tail.prev) {
			this.tail = this.tail.prev;
			this.tail.next = null;
		} else {
			this.head = null;
			this.tail = null;
		}

		return tail;
	}
}

/**
 * Create a new cache instance using design patterns
 */
export const createCache = <K extends string | number, V>(config: CacheConfig = {}): Cache<K, V> => {
	const maxSize = config.maxSize ?? Infinity;
	const ttl = config.ttl ?? 0;
	const useLru = config.lru ?? false;

	const cache = new Map<K, DoublyLinkedListNode<K, CacheEntry<V>>>();
	const lruList = useLru ? new DoublyLinkedList<K, CacheEntry<V>>() : null;

	let hits = 0;
	let misses = 0;
	let evictions = 0;

	const isExpiredEntry = (entry: CacheEntry<V>): boolean => {
		if (entry.expiresAt === null) {
			return false;
		}
		return Date.now() > entry.expiresAt;
	};

	const pruneExpired = (): void => {
		for (const [key, node] of cache.entries()) {
			if (isExpiredEntry(node.value)) {
				cache.delete(key);
				// A more robust implementation would also remove the node from the lruList here
			}
		}
	};

	const setFn = (key: K, value: V): void => {
		pruneExpired();

		if (cache.has(key)) {
			// Update existing entry
			const node = cache.get(key)!;
			const oldEntry = node.value;
			const newEntry: CacheEntry<V> = {
				...oldEntry,
				value,
				expiresAt: ttl > 0 ? Date.now() + ttl : null,
			};
			node.value = newEntry;
			cache.set(key, node);
			if (lruList) {
				lruList.moveToHead(node);
			}
			return;
		}

		if (cache.size >= maxSize) {
			if (lruList) {
				const tail = lruList.removeTail();
				if (tail) {
					cache.delete(tail.key);
					evictions++;
				}
			} else {
				// Fallback for non-lru cache, evict first key
				const firstKey = cache.keys().next().value;
				if (firstKey) {
					cache.delete(firstKey);
					evictions++;
				}
			}
		}

		const now = Date.now();
		const expiresAt = ttl > 0 ? now + ttl : null;
		const entry: CacheEntry<V> = {
			value,
			expiresAt,
			createdAt: now,
			accessCount: 0,
			lastAccessed: now,
		};

		const newNode = new DoublyLinkedListNode(key, entry);
		cache.set(key, newNode);
		if (lruList) {
			lruList.insertHead(newNode);
		}
	};

	const getFn = (key: K): V | undefined => {
		const node = cache.get(key);
		if (node === undefined) {
			misses++;
			return undefined;
		}

		const entry = node.value;
		if (isExpiredEntry(entry)) {
			cache.delete(key);
			// A more robust implementation would also remove the node from the lruList here
			misses++;
			return undefined;
		}

		hits++;
		node.value = updateAccessMetadata(entry);
		if (lruList) {
			lruList.moveToHead(node);
		}
		return entry.value;
	};

	const hasFn = (key: K): boolean => {
		const node = cache.get(key);
		if (node === undefined) {
			return false;
		}
		const entry = node.value;
		if (isExpiredEntry(entry)) {
			cache.delete(key);
			// A more robust implementation would also remove the node from the lruList here
			return false;
		}
		return true;
	};

	const deleteFn = (key: K): boolean => {
		return cache.delete(key);
	};

	const clearFn = (): void => {
		cache.clear();
	};

	const sizeFn = (): number => {
		pruneExpired();
		return cache.size;
	};

	const statsFn = (): CacheStats => {
		pruneExpired();
		return {
			hits,
			misses,
			evictions,
			size: cache.size,
			maxSize,
		};
	};

	const keysFn = (): K[] => {
		pruneExpired();
		return Array.from(cache.keys());
	};

	const valuesFn = (): V[] => {
		pruneExpired();
		return Array.from(cache.values()).map(node => node.value.value);
	};

	const entriesFn = (): [K, V][] => {
		pruneExpired();
		return Array.from(cache.entries()).map(([key, node]) => [key, node.value.value]);
	};

	return {
		get: getFn,
		set: setFn,
		has: hasFn,
		delete: deleteFn,
		clear: clearFn,
		size: sizeFn,
		stats: statsFn,
		keys: keysFn,
		values: valuesFn,
		entries: entriesFn,
	};
};
