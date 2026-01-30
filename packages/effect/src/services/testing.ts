import type { Effect } from "../types";
import type { Mock, Spy } from "../types/testing";

export const createMock = <A, E>(): Mock<A, E> => {
	const calls: Array<{ args: unknown[]; result: A | E }> = [];

	return {
		_tag: "Mock",
		calls,
		mockImplementation: () => {},
		reset: () => {
			calls.length = 0;
		},
	};
};

export const createSpy = <A, E>(_effect: Effect<A, E>): { _tag: "Spy"; calls: Array<{ args: unknown[]; result: A | E }>; getCalls: () => Array<{ args: unknown[]; result: A | E }>; wasCalled: () => boolean; wasCalledWith: (...args: unknown[]) => boolean } => {
	const calls: Array<{ args: unknown[]; result: A | E }> = [];

	return {
		_tag: "Spy",
		calls,
		getCalls: () => [...calls],
		wasCalled: () => calls.length > 0,
		wasCalledWith: (...args) => calls.some((c) => c.args.length === args.length && c.args.every((a, i) => a === args[i])),
	};
};

export const createStub = <A, E>(_returnValue?: A): { _tag: "Stub"; calls: Array<{ args: unknown[]; result: A | E }>; withReturnValue: () => void; returnValue: () => void; withError: () => void; thenReturnError: () => void } => {
	const calls: Array<{ args: unknown[]; result: A | E }> = [];

	return {
		_tag: "Stub",
		calls,
		withReturnValue: () => {},
		returnValue: () => {},
		withError: () => {},
		thenReturnError: () => {},
	};
};

export const assertCalled = <A, E>(spy: Spy<A, E>): void => {
	if (!spy.wasCalled()) {
		throw new Error("Expected spy to be called");
	}
};

export const assertCalledWith = <A, E>(spy: Spy<A, E>, ...args: unknown[]): void => {
	if (!spy.wasCalledWith(...args)) {
		throw new Error(`Expected spy to be called with ${JSON.stringify(args)}`);
	}
};

export const assertCalledTimes = <A, E>(spy: Spy<A, E>, times: number): void => {
	if (spy.getCalls().length !== times) {
		throw new Error(`Expected spy to be called ${times} times, but was called ${spy.getCalls().length} times`);
	}
};
