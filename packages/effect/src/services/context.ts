import type { Layer, Tag } from "../types/context";
import type { Effect } from "../types/effect";

export class TagClass<I, S> implements Tag<I, S> {
	readonly _tag = "Tag" as const;
	readonly key: symbol;
	readonly of: (service: S) => I;

	constructor(key: symbol, of: (service: S) => I) {
		this.key = key;
		this.of = of;
	}
}

export const createTag = <I, S>(key: symbol, of: (service: S) => I): Tag<I, S> => {
	return new TagClass(key, of);
};

export class LayerClass<R, E> implements Layer<R, E> {
	readonly _tag = "Layer" as const;
	readonly _R: R;
	readonly _E: E;
	readonly build: () => Promise<R>;

	constructor(build: () => Promise<R>) {
		this._R = {} as R;
		this._E = {} as E;
		this.build = build;
	}
}

export const createLayer = <R, E>(build: () => Promise<R>): Layer<R, E> => {
	return new LayerClass(build);
};

export const provide = <A, E, R>(effect: Effect<A, E, R>, layer: Layer<R, E>): Effect<A, E> => {
	return async () => {
		await layer.build();
		return await effect();
	};
};
