export interface Counter {
	readonly name: string;
	readonly value: number;
	readonly labels?: Record<string, string>;
	increment(amount?: number): void;
	reset(): void;
}

export interface Gauge {
	readonly name: string;
	readonly value: number;
	readonly labels?: Record<string, string>;
	set(value: number): void;
	increment(amount?: number): void;
	decrement(amount?: number): void;
}

export interface Histogram {
	readonly name: string;
	readonly buckets: number[];
	readonly values: number[];
	readonly labels?: Record<string, string>;
	observe(value: number): void;
	reset(): void;
}

export class MemoryCounter implements Counter {
	constructor(
		public readonly name: string,
		public value = 0,
		public readonly labels?: Record<string, string>,
	) {}

	increment(amount = 1): void {
		this.value += amount;
	}

	reset(): void {
		this.value = 0;
	}
}

export class MemoryGauge implements Gauge {
	constructor(
		public readonly name: string,
		public value = 0,
		public readonly labels?: Record<string, string>,
	) {}

	set(value: number): void {
		this.value = value;
	}

	increment(amount = 1): void {
		this.value += amount;
	}

	decrement(amount = 1): void {
		this.value -= amount;
	}
}

export class MemoryHistogram implements Histogram {
	constructor(
		public readonly name: string,
		public readonly buckets: number[] = [1, 5, 10, 25, 50, 100, 250, 500, 1000],
		public values: number[] = [],
		public readonly labels?: Record<string, string>,
	) {}

	observe(value: number): void {
		this.values.push(value);
	}

	reset(): void {
		this.values = [];
	}
}

export const createCounter = (name: string, labels?: Record<string, string>): Counter => {
	return new MemoryCounter(name, 0, labels);
};

export const createGauge = (name: string, labels?: Record<string, string>): Gauge => {
	return new MemoryGauge(name, 0, labels);
};

export const createHistogram = (name: string, buckets?: number[], labels?: Record<string, string>): Histogram => {
	return new MemoryHistogram(name, buckets, [], labels);
};
