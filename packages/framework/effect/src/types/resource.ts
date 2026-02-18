export interface Resource<out A> {
	readonly _tag: "Resource";
	readonly acquire: () => Promise<A>;
	readonly release: (resource: A) => Promise<void>;
}

export interface ScopedResource<out A> {
	readonly _tag: "ScopedResource";
	readonly resource: A;
	readonly release: () => Promise<void>;
}
