import fs from "node:fs/promises";
import path from "node:path";
import type { FileNode, ImportSpecifier, ReExport } from "../types";

type SerializableImportSpecifier = {
	module: string;
	specifiers: string[];
};

type SerializableFileNode = {
	path: string;
	imports: SerializableImportSpecifier[];
	reExports: Array<{
		module: string;
		exportAll: boolean;
		specifiers: Array<[string, string]>;
	}>;
	exports: string[];
};

type CacheEntry = {
	mtimeMs: number;
	size: number;
	node: SerializableFileNode | null;
};

type CacheFile = {
	version: number;
	entries: Record<string, CacheEntry>;
};

const CACHE_VERSION = 1;

function toSerializable(node: FileNode): SerializableFileNode {
	return {
		path: node.path,
		imports: node.imports.map((i): SerializableImportSpecifier => ({
			module: i.module,
			specifiers: [...i.specifiers],
		})),
		reExports: node.reExports.map((r) => ({
			module: r.module,
			exportAll: r.exportAll,
			specifiers: [...r.specifiers.entries()],
		})),
		exports: [...node.exports],
	};
}

function fromSerializable(node: SerializableFileNode): FileNode {
	return {
		path: node.path,
		imports: node.imports.map((i): ImportSpecifier => ({
			module: i.module,
			specifiers: new Set(i.specifiers),
		})),
		reExports: node.reExports.map((r): ReExport => ({
			module: r.module,
			exportAll: r.exportAll,
			specifiers: new Map(r.specifiers),
		})),
		exports: new Set(node.exports),
	};
}

export class DiskCache {
	private cachePath: string;
	private data: CacheFile;
	private dirty = false;

	private constructor(cachePath: string, data: CacheFile) {
		this.cachePath = cachePath;
		this.data = data;
	}

	static async load(cwd: string, fileName: string): Promise<DiskCache> {
		const cachePath = path.isAbsolute(fileName) ? fileName : path.join(cwd, fileName);
		try {
			const raw = await fs.readFile(cachePath, "utf-8");
			const parsed = JSON.parse(raw) as CacheFile;
			if (parsed.version !== CACHE_VERSION || !parsed.entries) {
				return new DiskCache(cachePath, { version: CACHE_VERSION, entries: {} });
			}
			return new DiskCache(cachePath, parsed);
		} catch {
			return new DiskCache(cachePath, { version: CACHE_VERSION, entries: {} });
		}
	}

	get(filePath: string, meta: { mtimeMs: number; size: number }): FileNode | null | undefined {
		const entry = this.data.entries[filePath];
		if (!entry) return undefined;
		if (entry.mtimeMs !== meta.mtimeMs || entry.size !== meta.size) return undefined;
		return entry.node ? fromSerializable(entry.node) : null;
	}

	set(filePath: string, meta: { mtimeMs: number; size: number }, node: FileNode | null): void {
		this.data.entries[filePath] = {
			mtimeMs: meta.mtimeMs,
			size: meta.size,
			node: node ? toSerializable(node) : null,
		};
		this.dirty = true;
	}

	async save(): Promise<void> {
		if (!this.dirty) return;
		await fs.writeFile(this.cachePath, JSON.stringify(this.data, null, 2), "utf-8");
		this.dirty = false;
	}
}
