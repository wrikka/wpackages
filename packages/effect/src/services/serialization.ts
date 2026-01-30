import type { Effect } from "../types";
import type { Serializer, Deserializer, SerializationError } from "../types/serialization";

export const jsonSerializer = <A>(): Serializer<A> => ({
	_tag: "Serializer",
	serialize: (value) => JSON.stringify(value),
});

export const jsonDeserializer = <A>(): Deserializer<A> => ({
	_tag: "Deserializer",
	deserialize: (data) => JSON.parse(data),
});

export const serialize = <A, E>(
	effect: Effect<A, E>,
	serializer: Serializer<A>,
): Effect<string, E | SerializationError> => {
	return async () => {
		try {
			const value = await effect();
			return await serializer.serialize(value);
		} catch (error) {
			throw {
				_tag: "SerializationError",
				message: "Failed to serialize",
				cause: error,
			};
		}
	};
};

export const deserialize = <A, E>(
	effect: Effect<string, E>,
	deserializer: Deserializer<A>,
): Effect<A, E | SerializationError> => {
	return async () => {
		try {
			const data = await effect();
			return await deserializer.deserialize(data);
		} catch (error) {
			throw {
				_tag: "SerializationError",
				message: "Failed to deserialize",
				cause: error,
			};
		}
	};
};

export const fromJSON = <A>(data: string): Effect<A, SerializationError> => {
	return deserialize(succeed(data), jsonDeserializer<A>());
};

export const toJSON = <A, E>(effect: Effect<A, E>): Effect<string, E | SerializationError> => {
	return serialize(effect, jsonSerializer<A>());
};
