/**
 * Extended persistence for @wpackages/store
 * IndexedDB, compression, and encryption support
 */

import type { Store, Listener } from "../types";

export interface PersistenceAdapter<T> {
	get(key: string): Promise<T | null>;
	set(key: string, value: T): Promise<void>;
	remove(key: string): Promise<void>;
	clear(): Promise<void>;
}

export interface CompressionOptions {
	enabled: boolean;
	algorithm?: "gzip" | "deflate";
}

export interface EncryptionOptions {
	enabled: boolean;
	key?: string;
}

export interface HydrationStrategy<T> {
	hydrate(key: string): Promise<T | null>;
	persist(key: string, value: T): Promise<void>;
}

/**
 * IndexedDB persistence adapter
 */
export class IndexedDBAdapter<T> implements PersistenceAdapter<T> {
	private db: IDBDatabase | null = null;
	private dbName: string;
	private storeName: string;

	constructor(dbName = "wpackages-store", storeName = "state") {
		this.dbName = dbName;
		this.storeName = storeName;
	}

	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, 1);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(this.storeName)) {
					db.createObjectStore(this.storeName);
				}
			};
		});
	}

	async get(key: string): Promise<T | null> {
		if (!this.db) {
			await this.init();
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);
			const request = store.get(key);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				resolve(request.result ?? null);
			};
		});
	}

	async set(key: string, value: T): Promise<void> {
		if (!this.db) {
			await this.init();
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.put(value, key);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async remove(key: string): Promise<void> {
		if (!this.db) {
			await this.init();
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.delete(key);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async clear(): Promise<void> {
		if (!this.db) {
			await this.init();
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.clear();

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}
}

/**
 * Compression utilities
 */
export class CompressionUtil {
	static async compress(data: string, algorithm: "gzip" | "deflate" = "gzip"): Promise<Uint8Array> {
		if (typeof CompressionStream === "undefined") {
			return new TextEncoder().encode(data);
		}

		const stream = new CompressionStream(algorithm);
		const writer = stream.writable.getWriter();
		const encoder = new TextEncoder();

		void writer.write(encoder.encode(data));
		void writer.close();

		const reader = stream.readable.getReader();
		const chunks: Uint8Array[] = [];

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(value);
		}

		const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
		const result = new Uint8Array(totalLength);
		let offset = 0;

		for (const chunk of chunks) {
			result.set(chunk, offset);
			offset += chunk.length;
		}

		return result;
	}

	static async decompress(data: Uint8Array, algorithm: "gzip" | "deflate" = "gzip"): Promise<string> {
		if (typeof DecompressionStream === "undefined") {
			return new TextDecoder().decode(data);
		}

		const stream = new DecompressionStream(algorithm);
		const writer = stream.writable.getWriter();

		void writer.write(data);
		void writer.close();

		const reader = stream.readable.getReader();
		const chunks: Uint8Array[] = [];

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(value);
		}

		const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
		const result = new Uint8Array(totalLength);
		let offset = 0;

		for (const chunk of chunks) {
			result.set(chunk, offset);
			offset += chunk.length;
		}

		return new TextDecoder().decode(result);
	}
}

/**
 * Encryption utilities (simple XOR encryption for demo)
 */
export class EncryptionUtil {
	static encrypt(data: string, key: string): string {
		let result = "";
		for (let i = 0; i < data.length; i++) {
			result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
		}
		return btoa(result);
	}

	static decrypt(data: string, key: string): string {
		const decoded = atob(data);
		let result = "";
		for (let i = 0; i < decoded.length; i++) {
			result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
		}
		return result;
	}
}

/**
 * Creates a compression middleware
 * @param options Compression options
 * @returns Middleware function
 */
export function compressionMiddleware<T>(options: CompressionOptions = { enabled: false }) {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: async (value: T) => {
				if (options.enabled) {
					const serialized = JSON.stringify(value);
					const compressed = await CompressionUtil.compress(serialized, options.algorithm);
					originalSet(compressed as unknown as T);
				} else {
					originalSet(value);
				}
			},
		};
	};
}

/**
 * Creates an encryption middleware
 * @param options Encryption options
 * @returns Middleware function
 */
export function encryptionMiddleware<T>(options: EncryptionOptions = { enabled: false }) {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value: T) => {
				if (options.enabled && options.key) {
					const serialized = JSON.stringify(value);
					const encrypted = EncryptionUtil.encrypt(serialized, options.key);
					originalSet(encrypted as unknown as T);
				} else {
					originalSet(value);
				}
			},
		};
	};
}

/**
 * Creates a hydration strategy
 * @param adapter The persistence adapter
 * @param compression Compression options
 * @param encryption Encryption options
 * @returns Hydration strategy
 */
export function createHydrationStrategy<T>(
	adapter: PersistenceAdapter<T>,
	compression: CompressionOptions = { enabled: false },
	encryption: EncryptionOptions = { enabled: false },
): HydrationStrategy<T> {
	return {
		async hydrate(key: string): Promise<T | null> {
			try {
				let data = await adapter.get(key);

				if (!data) {
					return null;
				}

				if (encryption.enabled && encryption.key) {
					const encrypted = data as unknown as string;
					const decrypted = EncryptionUtil.decrypt(encrypted, encryption.key);
					data = JSON.parse(decrypted) as T;
				}

				if (compression.enabled) {
					const compressed = data as unknown as Uint8Array;
					const decompressed = await CompressionUtil.decompress(compressed, compression.algorithm);
					data = JSON.parse(decompressed) as T;
				}

				return data;
			} catch {
				return null;
			}
		},

		async persist(key: string, value: T): Promise<void> {
			let data = value;

			if (compression.enabled) {
				const serialized = JSON.stringify(value);
				const compressed = await CompressionUtil.compress(serialized, compression.algorithm);
				data = compressed as unknown as T;
			}

			if (encryption.enabled && encryption.key) {
				const serialized = JSON.stringify(data);
				const encrypted = EncryptionUtil.encrypt(serialized, encryption.key);
				data = encrypted as unknown as T;
			}

			await adapter.set(key, data);
		},
	};
}

/**
 * Creates a store with IndexedDB persistence
 * @param store The store to enhance
 * @param adapter The IndexedDB adapter
 * @param key Storage key
 * @returns A store with IndexedDB persistence
 */
export function withIndexedDBPersistence<T>(
	store: Store<T>,
	adapter: IndexedDBAdapter<T>,
	key: string,
): Store<T> {
	let initialized = false;

	const initialize = async () => {
		if (!initialized) {
			await adapter.init();
			initialized = true;
		}
	};

	const loadState = async () => {
		await initialize();
		const persisted = await adapter.get(key);
		if (persisted !== null) {
			store.set(persisted);
		}
	};

	const persistState = async (value: T) => {
		await initialize();
		await adapter.set(key, value);
	};

	const enhancedStore: Store<T> = {
		get: store.get.bind(store),
		set: (value: T) => {
			store.set(value);
			void persistState(value);
		},
		subscribe: (listener: Listener<T>) => {
			const unsubscribe = store.subscribe(listener);

			void loadState();

			return unsubscribe;
		},
	};

	return enhancedStore;
}
