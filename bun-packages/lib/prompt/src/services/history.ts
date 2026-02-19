import type { HistoryEntry, HistoryManager, HistoryOptions } from "../types/history";

const memoryStore = new Map<string, HistoryEntry<string>[]>();

export const createHistoryManager = <T = string>(
	options: HistoryOptions,
): HistoryManager<T> => {
	const { key, maxSize = 100, persist = false, storage = "memory", storagePath: _storagePath } = options;

	const getStore = (): HistoryEntry<T>[] => {
		if (storage === "memory" || !persist) {
			return (memoryStore.get(key) ?? []) as HistoryEntry<T>[];
		}
		return [];
	};

	const saveStore = (entries: HistoryEntry<T>[]): void => {
		if (storage === "memory" || !persist) {
			memoryStore.set(key, entries as HistoryEntry<string>[]);
		}
	};

	const get = (): HistoryEntry<T>[] => {
		return getStore();
	};

	const add = (value: T): void => {
		const entries = getStore();
		const existingIndex = entries.findIndex((e) => e.value === value);

		if (existingIndex >= 0) {
			entries[existingIndex]!.count += 1;
			entries[existingIndex]!.timestamp = Date.now();
		} else {
			entries.unshift({
				value,
				timestamp: Date.now(),
				count: 1,
			});
		}

		if (entries.length > maxSize) {
			entries.splice(maxSize);
		}

		saveStore(entries);
	};

	const remove = (value: T): void => {
		const entries = getStore().filter((e) => e.value !== value);
		saveStore(entries);
	};

	const clear = (): void => {
		saveStore([]);
	};

	const search = (query: string): HistoryEntry<T>[] => {
		const lowerQuery = query.toLowerCase();
		return getStore().filter((e) => String(e.value).toLowerCase().includes(lowerQuery));
	};

	const getTop = (n = 10): T[] => {
		return getStore()
			.sort((a, b) => b.count - a.count)
			.slice(0, n)
			.map((e) => e.value);
	};

	return {
		get,
		add,
		remove,
		clear,
		search,
		getTop,
	};
};
