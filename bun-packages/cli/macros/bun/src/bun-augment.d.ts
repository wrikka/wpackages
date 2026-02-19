declare const Bun: {
	macro<TArgs extends readonly unknown[], TResult>(
		fn: (...args: TArgs) => TResult,
	): (...args: TArgs) => TResult;
};

interface ImportMeta {
	readonly line: number;
	readonly path: string;
	readonly dir: string;
}
