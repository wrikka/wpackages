export interface Either<out _L, out _R> {
	readonly _tag: "Left" | "Right";
}

export interface Left<out L> extends Either<L, never> {
	readonly _tag: "Left";
	readonly left: L;
}

export interface Right<out R> extends Either<never, R> {
	readonly _tag: "Right";
	readonly right: R;
}
