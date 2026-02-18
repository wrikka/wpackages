import type { AsyncResult, Failure, Result, Success } from "../types";

export const success = <A>(value: A): Success<A> => ({
	_tag: "Success",
	value,
});

export const failure = <E>(error: E): Failure<E> => ({
	_tag: "Failure",
	error,
});

export const isSuccess = <E, A>(result: Result<E, A>): result is Success<A> => result._tag === "Success";

export const isFailure = <E, A>(result: Result<E, A>): result is Failure<E> => result._tag === "Failure";

export const mapResult = <A, B>(f: (a: A) => B) => <E>(result: Result<E, A>): Result<E, B> => {
	return isSuccess(result) ? success(f(result.value)) : result;
};

export const flatMapResult = <A, B, E2>(f: (a: A) => Result<E2, B>) => <E>(result: Result<E, A>): Result<E | E2, B> => {
	return isSuccess(result) ? f(result.value) : result;
};

export const foldResult =
	<E, A, B>(onFailure: (error: E) => B, onSuccess: (value: A) => B) => (result: Result<E, A>): B => {
		return isSuccess(result)
			? onSuccess(result.value)
			: onFailure(result.error);
	};

export const getOrElse = <E, A>(defaultValue: A) => (result: Result<E, A>): A => {
	return isSuccess(result) ? result.value : defaultValue;
};

export const getOrThrow = <E, A>(result: Result<E, A>): A => {
	if (isSuccess(result)) {
		return result.value;
	}
	throw result.error;
};

export const toAsyncResult = <E, A>(result: Result<E, A>): AsyncResult<E, A> => Promise.resolve(result);

export const fromPromise = async <E, A>(
	promise: Promise<A>,
	onError: (error: unknown) => E,
): Promise<Result<E, A>> => {
	try {
		const value = await promise;
		return success(value);
	} catch (error) {
		return failure(onError(error));
	}
};
