export interface HistoryEntry<T = string> {
	value: T;
	timestamp: number;
	count: number;
}

export interface HistoryOptions {
	key: string;
	maxSize?: number;
	persist?: boolean;
	storage?: "memory" | "localStorage" | "file";
	storagePath?: string;
}

export interface HistoryManager<T = string> {
	get: () => HistoryEntry<T>[];
	add: (value: T) => void;
	remove: (value: T) => void;
	clear: () => void;
	search: (query: string) => HistoryEntry<T>[];
	getTop: (n?: number) => T[];
}
