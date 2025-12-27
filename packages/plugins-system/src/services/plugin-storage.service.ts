import type { PluginRegistry } from "../types";
import { formatFileOperationError } from "../components";
import { registryToJson, jsonToRegistry } from "../components";

export interface PluginStorage {
	readonly save: (registry: PluginRegistry) => Promise<void>;
	readonly load: () => Promise<PluginRegistry>;
	readonly clear: () => Promise<void>;
	readonly exists: () => Promise<boolean>;
}

export const createFileStorage = (filePath: string): PluginStorage => {
	const save = async (registry: PluginRegistry): Promise<void> => {
		try {
			const { writeFile, mkdir } = await import("node:fs/promises");
			const { dirname } = await import("node:path");

			await mkdir(dirname(filePath), { recursive: true });

			const json = registryToJson(registry);
			await writeFile(filePath, json, "utf-8");
		} catch (error) {
			throw new Error(formatFileOperationError("save", filePath, error));
		}
	};

	const load = async (): Promise<PluginRegistry> => {
		try {
			const { readFile } = await import("node:fs/promises");
			const data = await readFile(filePath, "utf-8");
			return jsonToRegistry(data);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				return {};
			}
			throw new Error(formatFileOperationError("load", filePath, error));
		}
	};

	const clear = async (): Promise<void> => {
		try {
			const { unlink } = await import("node:fs/promises");
			await unlink(filePath);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				throw new Error(formatFileOperationError("clear", filePath, error));
			}
		}
	};

	const exists = async (): Promise<boolean> => {
		try {
			const { access } = await import("node:fs/promises");
			await access(filePath);
			return true;
		} catch {
			return false;
		}
	};

	return Object.freeze({ clear, exists, load, save });
};

export const createMemoryStorage = (): PluginStorage => {
	let storage: PluginRegistry = {};

	const save = async (registry: PluginRegistry): Promise<void> => {
		storage = registry;
	};

	const load = async (): Promise<PluginRegistry> => {
		return storage;
	};

	const clear = async (): Promise<void> => {
		storage = {};
	};

	const exists = async (): Promise<boolean> => {
		return Object.keys(storage).length > 0;
	};

	return Object.freeze({ clear, exists, load, save });
};
