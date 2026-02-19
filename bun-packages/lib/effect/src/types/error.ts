export interface TaggedError<out T extends string> {
	readonly _tag: T;
}

export type ErrorWithCause<out T extends string> = TaggedError<T> & {
	readonly cause?: unknown;
};

export interface Cause<out E> {
	readonly _tag: "Cause";
	readonly error: E;
	readonly stack?: string;
}
