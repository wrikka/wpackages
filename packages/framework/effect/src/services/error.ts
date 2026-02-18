import type { TaggedError } from "../types";

export const createTaggedError = <T extends string>(tag: T) => {
	return class implements TaggedError<T> {
		readonly _tag = tag;
		constructor(readonly message: string, readonly cause?: unknown) {}
	};
};

export const TaggedError = createTaggedError("TaggedError");

export const UnknownError = createTaggedError("UnknownError");

export const TimeoutError = createTaggedError("TimeoutError");

export const NotFoundError = createTaggedError("NotFoundError");

export const ValidationError = createTaggedError("ValidationError");

export const DatabaseError = createTaggedError("DatabaseError");

export const NetworkError = createTaggedError("NetworkError");
