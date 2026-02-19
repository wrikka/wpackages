export interface Result<out _E, out _A> {
	readonly _tag: "Success" | "Failure";
}

export interface Success<out A> extends Result<never, A> {
	readonly _tag: "Success";
	readonly value: A;
}

export interface Failure<out E> extends Result<E, never> {
	readonly _tag: "Failure";
	readonly error: E;
}

export type AsyncResult<out E, out A> = Promise<Result<E, A>>;
