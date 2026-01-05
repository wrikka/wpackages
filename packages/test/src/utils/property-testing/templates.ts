import * as fc from "fast-check";

export const templates = {
	// Commutative property: a + b = b + a
	commutative: <T>(
		arb: fc.Arbitrary<T>,
		operation: (a: T, b: T) => T,
		equality: (a: T, b: T) => boolean = (a, b) => a === b,
	) =>
		fc.property(arb, arb, (a, b) => {
			const result1 = operation(a, b);
			const result2 = operation(b, a);
			return equality(result1, result2);
		}),

	// Associative property: (a + b) + c = a + (b + c)
	associative: <T>(
		arb: fc.Arbitrary<T>,
		operation: (a: T, b: T) => T,
		equality: (a: T, b: T) => boolean = (a, b) => a === b,
	) =>
		fc.property(arb, arb, arb, (a, b, c) => {
			const result1 = operation(operation(a, b), c);
			const result2 = operation(a, operation(b, c));
			return equality(result1, result2);
		}),

	// Identity property: a + identity = a
	identity: <T>(
		arb: fc.Arbitrary<T>,
		operation: (a: T, b: T) => T,
		identityElement: T,
		equality: (a: T, b: T) => boolean = (a, b) => a === b,
	) =>
		fc.property(arb, (a) => {
			const result = operation(a, identityElement);
			return equality(result, a);
		}),

	// Idempotent property: f(f(x)) = f(x)
	idempotent: <T>(
		arb: fc.Arbitrary<T>,
		func: (value: T) => T,
		equality: (a: T, b: T) => boolean = (a, b) => a === b,
	) =>
		fc.property(arb, (x) => {
			const result1 = func(x);
			const result2 = func(result1);
			return equality(result1, result2);
		}),

	// Round-trip property: serialize(deserialize(x)) = x
	roundTrip: <T, U>(
		arb: fc.Arbitrary<T>,
		serialize: (value: T) => U,
		deserialize: (value: U) => T,
		equality: (a: T, b: T) => boolean = (a, b) => a === b,
	) =>
		fc.property(arb, (x) => {
			const serialized = serialize(x);
			const deserialized = deserialize(serialized);
			return equality(x, deserialized);
		}),

	// Monoid laws
	monoid: <T>(
		arb: fc.Arbitrary<T>,
		combine: (a: T, b: T) => T,
		identity: T,
		equality: (a: T, b: T) => boolean = (a, b) => a === b,
	) => ({
		associativity: fc.property(arb, arb, arb, (a, b, c) => {
			const left = combine(combine(a, b), c);
			const right = combine(a, combine(b, c));
			return equality(left, right);
		}),
		leftIdentity: fc.property(arb, (a) => {
			const result = combine(identity, a);
			return equality(result, a);
		}),
		rightIdentity: fc.property(arb, (a) => {
			const result = combine(a, identity);
			return equality(result, a);
		}),
	}),
};
