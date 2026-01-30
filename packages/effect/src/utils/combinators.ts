import type { Effect } from "../types";

export const map = <A, B>(f: (a: A) => B) => <E, R>(effect: Effect<A, E, R>): Effect<B, E, R> => {
	return (async () => {
		const value = await effect();
		return f(value as A);
	}) as Effect<B, E, R>;
};

export const flatMap = <A, B, E2, R2>(
	f: (a: A) => Effect<B, E2, R2>,
) => <E, R>(effect: Effect<A, E, R>): Effect<B, E | E2, R | R2> => {
	return (async () => {
		const value = await effect();
		const nextEffect = f(value as A);
		return await nextEffect();
	}) as Effect<B, E | E2, R | R2>;
};

export const andThen = flatMap;

export const tap = <A, E2, R2>(f: (a: A) => Effect<void, E2, R2>) => <E, R>(
	effect: Effect<A, E, R>,
): Effect<A, E | E2, R | R2> => {
	return (async () => {
		const value = await effect();
		await f(value as A)();
		return value;
	}) as Effect<A, E | E2, R | R2>;
};

export const chain = flatMap;

export const bind = <N extends string, A, B, E2, R2>(
	name: Exclude<N, keyof A>,
	f: (a: A) => Effect<B, E2, R2>,
) => <E, R>(effect: Effect<A, E, R>): Effect<A & { [K in N]: B }, E | E2, R | R2> => {
	return (async () => {
		const value = await effect();
		const nextValue = await f(value as A)();
		return { ...value, [name]: nextValue };
	}) as Effect<A & { [K in N]: B }, E | E2, R | R2>;
};

export const pipe = <A>(value: A) => {
	return <B>(fn: (a: A) => B): B => fn(value);
};

export const all = <const Effects extends readonly Effect<any, any, any>[]>(
	effects: Effects,
): Effect<
	{
		[K in keyof Effects]: Effects[K] extends Effect<infer A, any, any> ? A : never;
	},
	Effects[number] extends Effect<any, infer E, any> ? E : never,
	Effects[number] extends Effect<any, any, infer R> ? R : never
> => {
	return (async () => {
		const results = await Promise.all(effects.map((effect) => effect())) as {
			[K in keyof Effects]: Effects[K] extends Effect<infer A, any, any> ? A : never;
		};
		return results;
	}) as Effect<
		{
			[K in keyof Effects]: Effects[K] extends Effect<infer A, any, any> ? A : never;
		},
		Effects[number] extends Effect<any, infer E, any> ? E : never,
		Effects[number] extends Effect<any, any, infer R> ? R : never
		>;
};

export const allSuccesses = <const Effects extends readonly Effect<any, any, any>[]>(
	effects: Effects,
): Effect<
	{
		[K in keyof Effects]: Effects[K] extends Effect<infer A, any, any> ? A : never;
	}[number][],
	Effects[number] extends Effect<any, infer E, any> ? E : never,
	Effects[number] extends Effect<any, any, infer R> ? R : never
> => {
	return (async () => {
		const results: (
			Effects[number] extends Effect<infer A, any, any> ? A : never
		)[] = [];
		for (const effect of effects) {
			try {
				const result = await effect();
				results.push(result);
			} catch {
				// Skip failures
			}
		}
		return results;
	}) as Effect<
		{
			[K in keyof Effects]: Effects[K] extends Effect<infer A, any, any> ? A : never;
		}[number][],
		Effects[number] extends Effect<any, infer E, any> ? E : never,
		Effects[number] extends Effect<any, any, infer R> ? R : never
		>;
};

export const forEach = <A, B, E, R>(
	f: (a: A) => Effect<B, E, R>,
) => (items: readonly A[]): Effect<B[], E, R> => {
	return (async () => {
		const results: B[] = [];
		for (const item of items) {
			const result = await f(item)();
			results.push(result);
		}
		return results;
	}) as Effect<B[], E, R>;
};

export const race = <const Effects extends readonly Effect<any, any, any>[]>(
	effects: Effects,
): Effect<
	Effects[number] extends Effect<infer A, any, any> ? A : never,
	Effects[number] extends Effect<any, infer E, any> ? E : never,
	Effects[number] extends Effect<any, any, infer R> ? R : never
> => {
	return (async () => {
		return await Promise.race(effects.map((effect) => effect())) as 
			Effects[number] extends Effect<infer A, any, any> ? A : never;
	}) as Effect<
		Effects[number] extends Effect<infer A, any, any> ? A : never,
		Effects[number] extends Effect<any, infer E, any> ? E : never,
		Effects[number] extends Effect<any, any, infer R> ? R : never
		>;
};

export const raceAll = <const Effects extends readonly Effect<any, any, any>[]>(
	effects: Effects,
): Effect<
	Effects[number] extends Effect<infer A, any, any> ? A : never,
	Effects[number] extends Effect<any, infer E, any> ? E : never,
	Effects[number] extends Effect<any, any, infer R> ? R : never
> => {
	return (async () => {
		return await Promise.any(effects.map((effect) => effect())) as 
			Effects[number] extends Effect<infer A, any, any> ? A : never;
	}) as Effect<
		Effects[number] extends Effect<infer A, any, any> ? A : never,
		Effects[number] extends Effect<any, infer E, any> ? E : never,
		Effects[number] extends Effect<any, any, infer R> ? R : never
		>;
};
