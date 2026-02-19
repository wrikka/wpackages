export type ParserResult<E, A> = { _tag: "Success"; value: A } | { _tag: "Failure"; error: E };

export const ok = <A, E>(value: A): ParserResult<E, A> => ({ _tag: "Success", value });

export const err = <E, A>(error: E): ParserResult<E, A> => ({ _tag: "Failure", error });

export const isSuccess = <E, A>(result: ParserResult<E, A>): result is { _tag: "Success"; value: A } =>
	result._tag === "Success";
