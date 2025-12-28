import { Effect, Option } from "effect";

export interface Iterator<T> {
	readonly current: Effect.Effect<Option.Option<T>>;
	readonly next: Effect.Effect<Option.Option<T>>;
	readonly hasNext: Effect.Effect<boolean>;
}

export const createArrayIterator = <T>(collection: T[]): Iterator<T> => {
	let position = 0;

	return {
		current: Effect.sync(() => Option.fromNullable(collection[position])),
		next: Effect.sync(() => {
			if (position < collection.length) {
				const result = collection[position];
				position += 1;
				return Option.some(result as T);
			}
			return Option.none();
		}),
		hasNext: Effect.sync(() => position < collection.length),
	};
};
