export type ValidationContext = { path: (string | number)[] };
export type Issue = {
	code?: string;
	message: string;
	path: (string | number)[];
	expected?: string;
	received?: unknown;
	minimum?: number;
	maximum?: number;
	validation?: string;
	pattern?: RegExp;
};
export type Result<T> =
	| { success: true; data: T }
	| { success: false; issues: Issue[] };
export type Schema<TInput, TOutput = TInput> = {
	transform: <TNewOutput>(
		transformer: (value: TOutput) => TNewOutput,
	) => Schema<TInput, TNewOutput>;
	shape?: Record<string, Schema<unknown, unknown>>;
	parse: (
		input: unknown,
		context?: Partial<ValidationContext>,
	) => Result<TOutput>;
	_metadata: { name?: string };
	_input: TInput;
	_output: TOutput;
};

export type Infer<S extends Schema<unknown, unknown>> = S extends Schema<unknown, infer O> ? O : never;
export enum ErrorCode {
	InvalidType = 0,
	InvalidLiteral = 1,
	InvalidEnumValue = 2,
	InvalidString = 3,
	InvalidNumber = 4,
	InvalidDate = 5,
	InvalidObject = 6,
	InvalidArray = 7,
	CustomError = 8,
}
export type StringOptions = {
	min?: number;
	max?: number;
	pattern?: RegExp;
	message?: string;
	name?: string;
};
export type NumberOptions = {
	min?: number;
	max?: number;
	integer?: boolean;
	message?: string;
	name?: string;
};

export type ObjectOptions<
	TShape extends Record<string, Schema<unknown, unknown>>,
> = {
	shape: TShape;
	message?: string;
	name?: string;
};

export type ArrayOptions<TItem extends Schema<unknown, unknown>> = {
	item: TItem;
	message?: string;
	name?: string;
};
export type SchemaOptions = {
	message?: string;
	name?: string;
	description?: string;
};
