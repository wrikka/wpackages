export interface Serializer<in A> {
	readonly _tag: "Serializer";
	serialize(value: A): string | Promise<string>;
}

export interface Deserializer<out A> {
	readonly _tag: "Deserializer";
	deserialize(data: string): A | Promise<A>;
}

export interface SerializationError {
	readonly _tag: "SerializationError";
	readonly message: string;
	readonly cause?: unknown;
}
