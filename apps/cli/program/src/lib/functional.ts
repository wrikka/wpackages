// ==================================
// Either
// ==================================
export type Left<E> = { readonly _tag: "Left"; readonly left: E };
export type Right<A> = { readonly _tag: "Right"; readonly right: A };
export type Either<E, A> = Left<E> | Right<A>;

export const left = <E>(e: E): Either<E, never> => ({ _tag: "Left", left: e });
export const right = <A>(a: A): Either<never, A> => ({
	_tag: "Right",
	right: a,
});

export const isLeft = <E, A>(ma: Either<E, A>): ma is Left<E> => ma._tag === "Left";
export const isRight = <E, A>(ma: Either<E, A>): ma is Right<A> => ma._tag === "Right";

// ==================================
// Effect
// ==================================
export type Effect<A, E = unknown, R = unknown> = (context: R) => Promise<Either<E, A>>;

// ==================================
// Runtime
// ==================================
export function runPromiseEither<A, E, R>(
	effect: Effect<A, E, R>,
	context?: R,
): Promise<Either<E, A>> {
	return effect(context as R);
}

export async function runPromise<A, E, R>(
	effect: Effect<A, E, R>,
	context?: R,
): Promise<A> {
	const either = await runPromiseEither(effect, context as R);
	if (isLeft(either)) {
		throw either.left;
	}
	return either.right;
}

// ==================================
// Constructors
// ==================================
export const succeed = <A>(value: A): Effect<A, never, never> => () => Promise.resolve(right(value));

export const fromPromise = <A>(promise: () => Promise<A>): Effect<A, unknown, never> => () =>
	promise().then(right).catch(left);

export const fail = <E>(error: E): Effect<never, E, never> => () => Promise.resolve(left(error));

// ==================================
// Combinators
// ==================================
export const flatMap = <A, B, E, R, E2, R2>(
	self: Effect<A, E, R>,
	f: (a: A) => Effect<B, E2, R2>,
): Effect<B, E | E2, R & R2> =>
async (ctx: R & R2) => {
	const eitherA = await runPromiseEither(self, ctx as R);
	if (isLeft(eitherA)) {
		return eitherA;
	}
	return runPromiseEither(f(eitherA.right), ctx as R2);
};

export const map = <A, B, E, R>(self: Effect<A, E, R>, f: (a: A) => B): Effect<B, E, R> => async (ctx) => {
	const eitherA = await runPromiseEither(self, ctx);
	return isLeft(eitherA) ? eitherA : right(f(eitherA.right));
};

export const mapError = <A, E, E2, R>(self: Effect<A, E, R>, f: (e: E) => E2): Effect<A, E2, R> => async (ctx) => {
	const eitherA = await runPromiseEither(self, ctx);
	return isRight(eitherA) ? eitherA : left(f(eitherA.left));
};

// ==================================
// Context
// ==================================
export class Tag<_T> {
	constructor(public readonly key: symbol = Symbol()) {}
}

export const get = <T>(tag: Tag<T>): Effect<T, Error, { [K in symbol]: T }> => (ctx) => {
	const service = ctx[tag.key];
	if (service === undefined) {
		return Promise.resolve(
			left(new Error(`Service for tag not found in context`)),
		);
	}
	return Promise.resolve(right(service));
};

export type Layer<R, E = any> = Effect<R, E, never>;

const mergeLayers = <R1 extends object, E1, R2 extends object, E2>(
	layer1: Layer<R1, E1>,
	layer2: Layer<R2, E2>,
): Layer<R1 & R2, E1 | E2> => flatMap(layer1, (r1) => flatMap(layer2, (r2) => succeed({ ...r1, ...r2 })));

const succeedLayer = <T>(
	tag: Tag<T>,
	service: T,
): Layer<{ [K in symbol]: T }, never> => succeed({ [tag.key]: service });

export const Layer = {
	merge: mergeLayers,
	succeed: succeedLayer,
};

export const provideLayer = <A, E, R_In, R, E2>(
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

// ==================================
// Gen
// ==================================
async function runGenerator(
	gen: Generator,
	context: unknown,
): Promise<Either<unknown, unknown>> {
	let result = gen.next();
	while (!result.done) {
		try {
			const effect = result.value as Effect<unknown, unknown, unknown>;
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

export const gen = <A>(f: () => Generator<unknown, A, unknown>): Effect<A, unknown, unknown> => (ctx) =>
	runGenerator(f(), ctx);

// ==================================
// Consolidated Export
// ==================================
export const Effect = {
	succeed,
	fromPromise,
	fail,
	flatMap,
	map,
	mapError,
	get,
	gen,
	runPromiseEither,
	runPromise,
	provideLayer,
	tag: <T>(id?: string) => new Tag<T>(Symbol(id)),
};
