export interface SearchOption<T> {
	readonly value: T;
	readonly label: string;
	readonly description?: string;
}

export interface SearchOptions<T> {
	readonly message: string;
	readonly options: readonly SearchOption<T>[];
	readonly placeholder?: string;
	readonly maxItems?: number;
}
