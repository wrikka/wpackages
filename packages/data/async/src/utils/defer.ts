import type { Deferred } from "../types";

export const defer = <A>(): Deferred<A> => {
	let resolve!: (value: A | PromiseLike<A>) => void;
	let reject!: (reason?: unknown) => void;

	const promise = new Promise<A>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
};
