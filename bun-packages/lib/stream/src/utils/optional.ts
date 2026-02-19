export class Optional<T> {
	private readonly value: T | null | undefined;

	private constructor(value: T | null | undefined) {
		this.value = value;
	}

	static of<T>(value: T | null | undefined): Optional<T> {
		return new Optional(value);
	}

	static empty<T>(): Optional<T> {
		return new Optional<T>(undefined);
	}

	isPresent(): boolean {
		return this.value !== null && this.value !== undefined;
	}

	get(): T {
		if (!this.isPresent()) {
			throw new Error("Value is not present");
		}
		return this.value as T;
	}

	orElse(other: T): T {
		return this.isPresent() ? this.get() : other;
	}

	orElseGet(supplier: () => T): T {
		return this.isPresent() ? this.get() : supplier();
	}

	map<R>(mapper: (value: T) => R): Optional<R> {
		if (this.isPresent()) {
			return Optional.of(mapper(this.get()));
		}
		return Optional.empty();
	}

	flatMap<R>(mapper: (value: T) => Optional<R>): Optional<R> {
		if (this.isPresent()) {
			return mapper(this.get());
		}
		return Optional.empty();
	}

	filter(predicate: (value: T) => boolean): Optional<T> {
		if (this.isPresent() && predicate(this.get())) {
			return this;
		}
		return Optional.empty();
	}

	ifPresent(consumer: (value: T) => void): void {
		if (this.isPresent()) {
			consumer(this.get());
		}
	}
}
