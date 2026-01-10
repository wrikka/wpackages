/**
 * Cache service for @wpackages/devserver
 * Handles transform cache and file metadata cache
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface CacheEntry {
	readonly content: string;
	readonly map?: string;
	readonly timestamp: number;
	readonly hash: string;
}

export interface TransformCache {
	readonly get: (key: string) => Promise<CacheEntry | null>;
	readonly set: (key: string, entry: CacheEntry) => Promise<void>;
	readonly invalidate: (key: string) => Promise<void>;
	readonly clear: () => Promise<void>;
}

export interface FileMetadata {
	readonly size: number;
	readonly mtime: number;
	readonly hash: string;
}

export interface MetadataCache {
	readonly get: (filePath: string) => Promise<FileMetadata | null>;
	readonly set: (filePath: string, metadata: FileMetadata) => Promise<void>;
	readonly invalidate: (filePath: string) => Promise<void>;
	readonly clear: () => Promise<void>;
}

export function createTransformCache(cacheDir: string): TransformCache {
	const cache = new Map<string, CacheEntry>();

	const getCachePath = (key: string) => join(cacheDir, "transform", `${key}.json`);

	return {
		async get(key: string): Promise<CacheEntry | null> {
			// Check in-memory cache first
			const memEntry = cache.get(key);
			if (memEntry) {
				return memEntry;
			}

			// Check disk cache
			try {
				const cachePath = getCachePath(key);
				const data = await readFile(cachePath, "utf-8");
				const entry: CacheEntry = JSON.parse(data);

				// Store in memory
				cache.set(key, entry);
				return entry;
			} catch {
				return null;
			}
		},

		async set(key: string, entry: CacheEntry): Promise<void> {
			// Store in memory
			cache.set(key, entry);

			// Store on disk
			try {
				const cachePath = getCachePath(key);
				await mkdir(join(cacheDir, "transform"), { recursive: true });
				await writeFile(cachePath, JSON.stringify(entry), "utf-8");
			} catch (error) {
				console.warn("Failed to write transform cache:", error);
			}
		},

		async invalidate(key: string): Promise<void> {
			cache.delete(key);
			try {
				const cachePath = getCachePath(key);
				await writeFile(cachePath, "", "utf-8");
			} catch {
				// Ignore
			}
		},

		async clear(): Promise<void> {
			cache.clear();
			try {
				const cachePath = join(cacheDir, "transform");
				const { rm } = await import("node:fs/promises");
				await rm(cachePath, { recursive: true, force: true });
			} catch {
				// Ignore errors when clearing disk cache
			}
		},
	};
}

export function createMetadataCache(cacheDir: string): MetadataCache {
	const cache = new Map<string, FileMetadata>();

	const getCachePath = (filePath: string) => {
		const hash = createHash("md5").update(filePath).digest("hex");
		return join(cacheDir, "metadata", `${hash}.json`);
	};

	return {
		async get(filePath: string): Promise<FileMetadata | null> {
			const memEntry = cache.get(filePath);
			if (memEntry) {
				return memEntry;
			}

			try {
				const cachePath = getCachePath(filePath);
				const data = await readFile(cachePath, "utf-8");
				const metadata: FileMetadata = JSON.parse(data);

				cache.set(filePath, metadata);
				return metadata;
			} catch {
				return null;
			}
		},

		async set(filePath: string, metadata: FileMetadata): Promise<void> {
			cache.set(filePath, metadata);

			try {
				const cachePath = getCachePath(filePath);
				await mkdir(join(cacheDir, "metadata"), { recursive: true });
				await writeFile(cachePath, JSON.stringify(metadata), "utf-8");
			} catch (error) {
				console.warn("Failed to write metadata cache:", error);
			}
		},

		async invalidate(filePath: string): Promise<void> {
			cache.delete(filePath);
			try {
				const cachePath = getCachePath(filePath);
				await writeFile(cachePath, "", "utf-8");
			} catch {
				// Ignore
			}
		},

		async clear(): Promise<void> {
			cache.clear();
			try {
				const cachePath = join(cacheDir, "metadata");
				const { rm } = await import("node:fs/promises");
				await rm(cachePath, { recursive: true, force: true });
			} catch {
				// Ignore errors when clearing disk cache
			}
		},
	};
}

export function createHashKey(content: string, id: string): string {
	return createHash("md5").update(content + id).digest("hex");
}
