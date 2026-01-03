import { Optional } from "./utils/optional";

export class Stream<T> {
	private readonly iterator: () => Iterator<T>;

	constructor(iterator: () => Iterator<T>) {
		this.iterator = iterator;
	}

	static of<T>(...elements: T[]): Stream<T> {
		return new Stream(() => elements[Symbol.iterator]());
	}

	static from<T>(source: Iterable<T>): Stream<T> {
		return new Stream(() => source[Symbol.iterator]());
	}

	static generate<T>(supplier: () => T): Stream<T> {
		return new Stream(function*(): Generator<T> {
			while (true) {
				yield supplier();
			}
		});
	}

	static iterate<T>(seed: T, f: (t: T) => T): Stream<T> {
		return new Stream(function*(): Generator<T> {
			let t = seed;
			while (true) {
				yield t;
				t = f(t);
			}
		});
	}

	static range(startInclusive: number, endExclusive: number): Stream<number> {
		return new Stream(function*(): Generator<number> {
			for (let i = startInclusive; i < endExclusive; i++) {
				yield i;
			}
		});
	}

	map<R>(mapper: (value: T) => R): Stream<R> {
		return new Stream(function*(this: Stream<T>): Generator<R> {
			for (const value of { [Symbol.iterator]: this.iterator }) {
				yield mapper(value);
			}
		}.bind(this));
	}

	filter(predicate: (value: T) => boolean): Stream<T> {
		return new Stream(function*(this: Stream<T>): Generator<T> {
			for (const value of { [Symbol.iterator]: this.iterator }) {
				if (predicate(value)) {
					yield value;
				}
			}
		}.bind(this));
	}

	flatMap<R>(mapper: (value: T) => Iterable<R>): Stream<R> {
		return new Stream(function*(this: Stream<T>): Generator<R> {
			for (const value of { [Symbol.iterator]: this.iterator }) {
				for (const mappedValue of mapper(value)) {
					yield mappedValue;
				}
			}
		}.bind(this));
	}

	peek(action: (value: T) => void): Stream<T> {
		return new Stream(function*(this: Stream<T>): Generator<T> {
			for (const value of { [Symbol.iterator]: this.iterator }) {
				action(value);
				yield value;
			}
		}.bind(this));
	}

	distinct(): Stream<T> {
		return new Stream(function*(this: Stream<T>): Generator<T> {
			const seen = new Set<T>();
			for (const value of { [Symbol.iterator]: this.iterator }) {
				if (!seen.has(value)) {
					seen.add(value);
					yield value;
				}
			}
		}.bind(this));
	}

	sorted(comparator?: (a: T, b: T) => number): Stream<T> {
		return new Stream(function*(this: Stream<T>): Generator<T> {
			const elements = [...{ [Symbol.iterator]: this.iterator }];
			elements.sort(comparator);
			for (const value of elements) {
				yield value;
			}
		}.bind(this));
	}

	limit(maxSize: number): Stream<T> {
		return new Stream(function*(this: Stream<T>): Generator<T> {
			let count = 0;
			if (maxSize <= 0) {
				return;
			}
			for (const value of { [Symbol.iterator]: this.iterator }) {
				yield value;
				count++;
				if (count >= maxSize) {
					break;
				}
			}
		}.bind(this));
	}

	skip(n: number): Stream<T> {
		return new Stream(function*(this: Stream<T>): Generator<T> {
			let count = 0;
			for (const value of { [Symbol.iterator]: this.iterator }) {
				if (count >= n) {
					yield value;
				}
				count++;
			}
		}.bind(this));
	}

	// Terminal operation
	collect(): T[] {
		return [...{ [Symbol.iterator]: this.iterator }];
	}

	forEach(action: (value: T) => void): void {
		for (const value of { [Symbol.iterator]: this.iterator }) {
			action(value);
		}
	}

	reduce(reducer: (accumulator: T, value: T) => T, identity?: T): Optional<T> {
		let accumulator = identity;
		for (const value of { [Symbol.iterator]: this.iterator }) {
			if (accumulator === undefined) {
				accumulator = value;
			} else {
				accumulator = reducer(accumulator, value);
			}
		}
		return Optional.of(accumulator);
	}

	findFirst(): Optional<T> {
		for (const value of { [Symbol.iterator]: this.iterator }) {
			return Optional.of(value);
		}
		return Optional.empty();
	}

	count(): number {
		let count = 0;
		for (const _ of { [Symbol.iterator]: this.iterator }) {
			count++;
		}
		return count;
	}

	anyMatch(predicate: (value: T) => boolean): boolean {
		for (const value of { [Symbol.iterator]: this.iterator }) {
			if (predicate(value)) {
				return true;
			}
		}
		return false;
	}

	allMatch(predicate: (value: T) => boolean): boolean {
		for (const value of { [Symbol.iterator]: this.iterator }) {
			if (!predicate(value)) {
				return false;
			}
		}
		return true;
	}

	noneMatch(predicate: (value: T) => boolean): boolean {
		for (const value of { [Symbol.iterator]: this.iterator }) {
			if (predicate(value)) {
				return false;
			}
		}
		return true;
	}

	join(separator?: string): string {
		return this.collect().join(separator);
	}
}
