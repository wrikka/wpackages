export interface TestDouble<out A, out E> {
	readonly _tag: "TestDouble";
	readonly calls: Array<{ args: unknown[]; result: A | E }>;
}

export interface Mock<A, E> extends TestDouble<A, E> {
	readonly _tag: "Mock";
	mockImplementation: (fn: (...args: unknown[]) => A | E) => void;
	reset: () => void;
}

export interface Spy<A, E> extends TestDouble<A, E> {
	readonly _tag: "Spy";
	getCalls: () => Array<{ args: unknown[]; result: A | E }>;
	wasCalled: () => boolean;
	wasCalledWith: (...args: unknown[]) => boolean;
}

export interface Stub<A, E> extends TestDouble<A, E> {
	readonly _tag: "Stub";
	withReturnValue: (value: A) => void;
	thenReturn: (value: A) => void;
	withError: (error: E) => void;
	thenReturnError: (error: E) => void;
}
