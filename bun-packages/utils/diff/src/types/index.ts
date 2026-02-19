export interface DiffResult {
	added: Record<string, unknown>;
	deleted: Record<string, unknown>;
	updated: Record<string, unknown>;
}

export interface DiffOptions {
	ignorePaths?: string[];
}

export enum ChangeType {
	ADD = 0,
	DELETE = 1,
	COMMON = 2,
}

export interface LcsChange {
	type: ChangeType;
	value: unknown;
	indexA?: number;
	indexB?: number;
}

export type Seen = WeakMap<object, WeakMap<object, boolean>>;

export interface DiffValue {
	__old: unknown;
	__new: unknown;
}
