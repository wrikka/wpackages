import type { Either, Left, Right } from "../types";

export const left = <L>(value: L): Left<L> => ({ _tag: "Left", left: value });

export const right = <R>(value: R): Right<R> => ({
	_tag: "Right",
	right: value,
});

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> => either._tag === "Left";

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> => either._tag === "Right";

export const mapEither = <L, R, R2>(f: (r: R) => R2) => (either: Either<L, R>): Either<L, R2> => {
	return isRight(either) ? right(f(either.right)) : either;
};

export const mapLeft = <L, L2, R>(f: (l: L) => L2) => (either: Either<L, R>): Either<L2, R> => {
	return isLeft(either) ? left(f(either.left)) : either;
};

export const flatMapEither = <L, R, R2>(f: (r: R) => Either<L, R2>) => (either: Either<L, R>): Either<L, R2> => {
	return isRight(either) ? f(either.right) : either;
};

export const foldEither = <L, R, B>(onLeft: (left: L) => B, onRight: (right: R) => B) => (either: Either<L, R>): B => {
	return isRight(either) ? onRight(either.right) : onLeft(either.left);
};

export const swap = <L, R>(either: Either<L, R>): Either<R, L> => {
	return isLeft(either) ? right(either.left) : left(either.right);
};

export const fromResult = <E, A>(
	result: { _tag: "Success"; value: A } | { _tag: "Failure"; error: E },
): Either<E, A> => {
	return result._tag === "Success" ? right(result.value) : left(result.error);
};

export const toResult = <L, R>(
	either: Either<L, R>,
): { _tag: "Success"; value: R } | { _tag: "Failure"; error: L } => {
	return isRight(either)
		? { _tag: "Success", value: either.right }
		: { _tag: "Failure", error: either.left };
};
