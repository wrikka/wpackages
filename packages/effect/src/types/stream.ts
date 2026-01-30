export interface Stream<out A> {
	readonly _tag: "Stream";
	[Symbol.asyncIterator](): AsyncIterator<A>;
}

export interface StreamOptions {
	readonly backpressure?: boolean;
	readonly bufferSize?: number;
}

export interface Transform<in A, out B> {
	readonly _tag: "Transform";
	transform(value: A): B | Promise<B>;
}
