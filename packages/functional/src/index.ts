import { isLeft, isRight, left, right } from "./types/Either";
import type { Either } from "./types/Either";
export * from "./types/Either";
export * from "./utils";

export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D;
export function pipe(value: any, ...fns: ((_: any) => any)[]): any {
	return fns.reduce((acc, fn) => fn(acc), value);
}

// biome-ignore lint/suspicious/noExplicitAny: Using any for simplified type erasure
export type Effect<A, E = any, R = any> = (context: R) => Promise<Either<E, A>>;

export class Tag<_T> {
	constructor(public readonly key: symbol = Symbol()) {}
}

// biome-ignore lint/suspicious/noExplicitAny: Using any for simplified type erasure
async function runGenerator(gen: Generator, context: any): Promise<Either<any, any>> {
	let result = gen.next();
	while (!result.done) {
		try {
			const effect = result.value as Effect<any, any, any>;
			const either = await effect(context);
			if (isLeft(either)) {
				return either;
			}
			result = gen.next(either.right);
		} catch (e) {
			return left(e);
		}
	}
	return right(result.value);
}

const succeed = <A>(value: A): Effect<A, never, never> => () => Promise.resolve(right(value));

const fromPromise = <A>(promise: () => Promise<A>): Effect<A, unknown, never> => () =>
	promise().then(right).catch(left);

const gen = <A>(f: () => Generator<any, A, any>): Effect<A, any, any> => (ctx) => runGenerator(f(), ctx);

const get = <T>(tag: Tag<T>): Effect<T, Error, { [K in symbol]: T }> => (ctx) => {
	const service = ctx[tag.key];
	if (service === undefined) {
		return Promise.resolve(left(new Error(`Service for tag not found in context`)));
	}
	return Promise.resolve(right(service));
};

const provide = <A, E, R, T>(
	effect: Effect<A, E, R>,
	tag: Tag<T>,
	service: T,
): Effect<A, E, Omit<R, keyof T>> =>
(ctx) => {
	const newContext = { ...ctx, [tag.key]: service };
	return effect(newContext as R);
};

function runPromiseEither<A, E, R>(effect: Effect<A, E, R>, context?: R): Promise<Either<E, A>> {
	return effect(context as R);
}

async function runPromise<A, E, R>(effect: Effect<A, E, R>, context?: R): Promise<A> {
	const either = await runPromiseEither(effect, context as R);
	if (isLeft(either)) {
		throw either.left;
	}
	return either.right;
}

const flatMap =
	<A, B, E, R, E2, R2>(self: Effect<A, E, R>, f: (a: A) => Effect<B, E2, R2>): Effect<B, E | E2, R & R2> =>
	async (ctx: R & R2) => {
		const eitherA = await runPromiseEither(self, ctx as R);
		if (isLeft(eitherA)) {
			return eitherA;
		}
		return runPromiseEither(f(eitherA.right), ctx as R2);
	};

export type Layer<R, E = any> = Effect<R, E, never>;

const merge = <R1 extends object, E1, R2 extends object, E2>(
	layer1: Layer<R1, E1>,
	layer2: Layer<R2, E2>,
): Layer<R1 & R2, E1 | E2> => flatMap(layer1, (r1) => flatMap(layer2, (r2) => succeed({ ...r1, ...r2 })));

const succeedLayer = <T>(tag: Tag<T>, service: T): Layer<{ [K in symbol]: T }, never> =>
	succeed({ [tag.key]: service });

export const Layer = {
	merge,
	succeed: succeedLayer,
};

const provideLayer = <A, E, R_In, R, E2>(
	effect: Effect<A, E, R_In>,
	layer: Layer<R, E2>,
): Effect<A, E | E2, Omit<R_In, keyof R>> =>
async (ctx: Omit<R_In, keyof R>) => {
	const eitherServices = await runPromiseEither(layer);
	if (isLeft(eitherServices)) {
		return eitherServices as Either<E | E2, A>;
	}
	const fullContext = { ...ctx, ...eitherServices.right } as R_In;
	return runPromiseEither(effect, fullContext);
};

const fail = <E>(error: E): Effect<never, E, never> => () => Promise.resolve(left(error));

const map = <A, B, E, R>(self: Effect<A, E, R>, f: (a: A) => B): Effect<B, E, R> => async (ctx) => {
	const eitherA = await runPromiseEither(self, ctx);
	return isLeft(eitherA) ? eitherA : right(f(eitherA.right));
};

const mapError = <A, E, E2, R>(self: Effect<A, E, R>, f: (e: E) => E2): Effect<A, E2, R> => async (ctx) => {
	const eitherA = await runPromiseEither(self, ctx);
	return isRight(eitherA) ? eitherA : left(f(eitherA.left));
};

const tap = <A, E, R>(self: Effect<A, E, R>, f: (a: A) => void): Effect<A, E, R> =>
	map(self, (a) => {
		f(a);
		return a;
	});

const tapError = <A, E, R>(self: Effect<A, E, R>, f: (e: E) => void): Effect<A, E, R> =>
	mapError(self, (e) => {
		f(e);
		return e;
	});

const match = <A, E, R, B>(
	self: Effect<A, E, R>,
	options: { readonly onSuccess: (a: A) => B; readonly onFailure: (e: E) => B },
): Effect<B, never, R> =>
async (ctx) => {
	const eitherA = await runPromiseEither(self, ctx);
	if (isLeft(eitherA)) {
		return right(options.onFailure(eitherA.left));
	}
	return right(options.onSuccess(eitherA.right));
};

const fold = match;

export const Effect = {
	provideLayer,
	flatMap,
	map,
	mapError,
	tap,
	tapError,
	match,
	fold,
	fail,
	succeed,
	fromPromise,
	gen,
	get,
	provide,
	runPromise,
	runPromiseEither,
	tag: <T>(id?: string) => new Tag<T>(Symbol(id)),
};
