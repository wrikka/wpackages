export class Lazy<T> {
	private value: T | null = null;
	private factory: () => T;

	constructor(factory: () => T) {
		this.factory = factory;
	}

	get(): T {
		if (this.value === null) {
			this.value = this.factory();
		}
		return this.value;
	}

	isEvaluated(): boolean {
		return this.value !== null;
	}
}

export function lazy<T>(factory: () => T): Lazy<T> {
	return new Lazy(factory);
}
