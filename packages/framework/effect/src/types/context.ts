export interface Context<out R> {
	readonly _tag: "Context";
	readonly _R: R;
}

export interface Tag<out I, out S> {
	readonly _tag: "Tag";
	readonly key: symbol;
	readonly of: (service: S) => I;
}

export interface Layer<out R, out E = never> {
	readonly _tag: "Layer";
	readonly _R: R;
	readonly _E: E;
	build: () => Promise<R>;
}
