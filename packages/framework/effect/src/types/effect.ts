export type Effect<out A, out _E = never, out _R = never> = () => Promise<A>;

export interface EffectSuccess<out A> {
	readonly _tag: "Success";
	readonly value: A;
}

export interface EffectFailure<out E> {
	readonly _tag: "Failure";
	readonly error: E;
}

export type EffectResult<out A, out E> = EffectSuccess<A> | EffectFailure<E>;

export interface EffectContext<out R> {
	readonly _tag: "Context";
	readonly _R: R;
}

export type EffectExit<out A, out E> =
	| { readonly _tag: "Success"; readonly value: A }
	| { readonly _tag: "Failure"; readonly error: E }
	| { readonly _tag: "Interrupt" };

export interface EffectOptions {
	readonly concurrency?: number | "unbounded";
	readonly mode?: "either" | "validate" | "all";
}
