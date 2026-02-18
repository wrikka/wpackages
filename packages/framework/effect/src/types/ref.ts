export interface Ref<A> {
	readonly _tag: "Ref";
	readonly get: () => Promise<A>;
	readonly set: (value: A) => Promise<void>;
	readonly update: (f: (a: A) => A) => Promise<A>;
	readonly modify: <B>(f: (a: A) => readonly [B, A]) => Promise<B>;
}

export interface SynchronizedRef<A> extends Ref<A> {
	readonly _tag: "SynchronizedRef";
}
