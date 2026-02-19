export interface Option<out _A> {
	readonly _tag: "Some" | "None";
}

export interface Some<out A> extends Option<A> {
	readonly _tag: "Some";
	readonly value: A;
}

export interface None extends Option<never> {
	readonly _tag: "None";
}
