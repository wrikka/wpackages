export type ConcurrencyMode = "sequential" | "parallel" | "race" | "all";

export interface ConcurrencyOptions {
	mode?: ConcurrencyMode;
	maxConcurrent?: number;
	timeout?: number;
	abortOnFirstError?: boolean;
}

export interface Task<T> {
	id: string;
	execute: () => Promise<T>;
	priority?: number;
	dependencies?: string[];
}

export interface ConcurrencyContext {
	addTask: <T>(task: Task<T>) => void;
	execute: <T>() => Promise<T[]>;
	cancel: () => void;
	getStatus: () => "idle" | "running" | "completed" | "cancelled";
}
