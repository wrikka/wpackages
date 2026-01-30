import type { Effect } from "../types";
import type { Stream } from "../types/stream";

export const fromAsyncIterable = <A>(
	iterable: AsyncIterable<A>,
): Stream<A> => {
	return {
		_tag: "Stream",
		async *[Symbol.asyncIterator]() {
			for await (const item of iterable) {
				yield item;
			}
		},
	};
};

export const fromArray = <A>(array: readonly A[]): Stream<A> => {
	return fromAsyncIterable(array);
};

export const fromEffect = <A, E>(effect: Effect<A, E>): Stream<A> => {
	return {
		_tag: "Stream",
		async *[Symbol.asyncIterator]() {
			yield await effect();
		},
	};
};

export const map = <A, B>(f: (a: A) => B | Promise<B>) => (
	stream: Stream<A>,
): Stream<B> => {
	return {
		_tag: "Stream",
		async *[Symbol.asyncIterator]() {
			for await (const item of stream) {
				yield await f(item);
			}
		},
	};
};

export const filter = <A>(predicate: (a: A) => boolean | Promise<boolean>) => (
	stream: Stream<A>,
): Stream<A> => {
	return {
		_tag: "Stream",
		async *[Symbol.asyncIterator]() {
			for await (const item of stream) {
				if (await predicate(item)) {
					yield item;
				}
			}
		},
	};
};

export const flatMap = <A, B>(f: (a: A) => Stream<B>) => (
	stream: Stream<A>,
): Stream<B> => {
	return {
		_tag: "Stream",
		async *[Symbol.asyncIterator]() {
			for await (const item of stream) {
				for await (const subItem of f(item)) {
					yield subItem;
				}
			}
		},
	};
};

export const reduce = <A, B>(f: (acc: B, a: A) => B | Promise<B>, initial: B) => (
	stream: Stream<A>,
): Effect<B> => {
	return async () => {
		let acc = initial;
		for await (const item of stream) {
			acc = await f(acc, item);
		}
		return acc;
	};
};

export const toArray = <A>(stream: Stream<A>): Effect<A[]> => {
	return async () => {
		const result: A[] = [];
		for await (const item of stream) {
			result.push(item);
		}
		return result;
	};
};

export const batch = <A>(size: number) => (stream: Stream<A>): Stream<A[]> => {
	return {
		_tag: "Stream",
		async *[Symbol.asyncIterator]() {
			let batch: A[] = [];
			for await (const item of stream) {
				batch.push(item);
				if (batch.length >= size) {
					yield batch;
					batch = [];
				}
			}
			if (batch.length > 0) {
				yield batch;
			}
		},
	};
};

export const merge = <const Streams extends readonly Stream<any>[]>(...streams: Streams): Stream<Streams[number][number]> => {
	return {
		_tag: "Stream",
		async *[Symbol.asyncIterator]() {
			const iterators = streams.map((s) => s[Symbol.asyncIterator]());
			const promises = iterators.map((it) => it.next());
			while (true) {
				const result = await Promise.race(promises);
				if (result.done) break;
				yield result.value;
				const index = promises.indexOf(result);
				promises[index] = iterators[index].next();
			}
		},
	};
};
