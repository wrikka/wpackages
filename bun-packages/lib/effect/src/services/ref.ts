import type { Ref, SynchronizedRef } from "../types";
import type { Effect } from "../types";

class RefImpl<A> implements Ref<A> {
	readonly _tag = "Ref" as const;
	private value: A;

	constructor(initial: A) {
		this.value = initial;
	}

	async get(): Promise<A> {
		return this.value;
	}

	async set(value: A): Promise<void> {
		this.value = value;
	}

	async update(f: (a: A) => A): Promise<A> {
		this.value = f(this.value);
		return this.value;
	}

	async modify<B>(f: (a: A) => readonly [B, A]): Promise<B> {
		const [result, newValue] = f(this.value);
		this.value = newValue;
		return result;
	}
}

class SynchronizedRefImpl<A> extends RefImpl<A> implements SynchronizedRef<A> {
	readonly _tag = "SynchronizedRef" as const;
	private lock = Promise.resolve();

	override async get(): Promise<A> {
		return this.lock.then(() => super.get());
	}

	override async set(value: A): Promise<void> {
		this.lock = this.lock.then(() => super.set(value));
		return this.lock;
	}

	override async update(f: (a: A) => A): Promise<A> {
		this.lock = this.lock.then(() => super.update(f));
		return this.lock;
	}

	override async modify<B>(f: (a: A) => readonly [B, A]): Promise<B> {
		let result: B;
		this.lock = this.lock.then(async () => {
			result = await super.modify(f);
		});
		await this.lock;
		return result!;
	}
}

export const make = <A>(initial: A): Ref<A> => {
	return new RefImpl(initial);
};

export const makeSynchronized = <A>(initial: A): SynchronizedRef<A> => {
	return new SynchronizedRefImpl(initial);
};

export const get = <A>(ref: Ref<A>): Effect<A> => {
	return () => ref.get();
};

export const set = <A>(ref: Ref<A>, value: A): Effect<void> => {
	return () => ref.set(value);
};

export const update = <A>(ref: Ref<A>, f: (a: A) => A): Effect<A> => {
	return () => ref.update(f);
};

export const modify = <A, B>(
	ref: Ref<A>,
	f: (a: A) => readonly [B, A],
): Effect<B> => {
	return () => ref.modify(f);
};

export const getAndSet = <A>(ref: Ref<A>, value: A): Effect<A> => {
	return async () => {
		const old = await ref.get();
		await ref.set(value);
		return old;
	};
};

export const getAndUpdate = <A>(ref: Ref<A>, f: (a: A) => A): Effect<A> => {
	return async () => {
		const old = await ref.get();
		await ref.update(f);
		return old;
	};
};
