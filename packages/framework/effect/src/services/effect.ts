import type { Effect, EffectExit } from "../types";

export class EffectRuntime {
	static async runPromise<A, E>(
		effect: Effect<A, E>,
	): Promise<EffectExit<A, E>> {
		try {
			const result = await effect();
			return { _tag: "Success", value: result as A };
		} catch (error) {
			return { _tag: "Failure", error: error as E };
		}
	}

	static runSync<A, E>(effect: Effect<A, E>): EffectExit<A, E> {
		try {
			const result = effect();
			return { _tag: "Success", value: result as A };
		} catch (error) {
			return { _tag: "Failure", error: error as E };
		}
	}
}

export const succeed = <A>(value: A): Effect<A> => {
	return (() => value) as Effect<A>;
};

export const fail = <E>(error: E): Effect<never, E> => {
	return (() => {
		throw error;
	}) as Effect<never, E>;
};

export const sync = <A>(f: () => A): Effect<A> => {
	return f as Effect<A>;
};

export const tryCatch = <A, E>(
	f: () => A,
	onError: (error: unknown) => E,
): Effect<A, E> => {
	return (() => {
		try {
			return f();
		} catch (error) {
			throw onError(error);
		}
	}) as Effect<A, E>;
};

export const suspend = <A, E>(f: () => Effect<A, E>): Effect<A, E> => {
	return (() => {
		const effect = f();
		return effect();
	}) as Effect<A, E>;
};

export const gen = <A, E, R>(
	generator: () => Generator<Effect<unknown, E, R>, A, unknown>,
): Effect<A, E, R> => {
	return (async () => {
		const gen = generator();
		let result = gen.next();

		while (!result.done) {
			const effect = result.value as Effect<unknown, E, R>;
			const value = await effect();
			result = gen.next(value);
		}

		return result.value;
	}) as Effect<A, E, R>;
};

export const runPromise = EffectRuntime.runPromise;
export const runSync = EffectRuntime.runSync;
