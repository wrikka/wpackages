import * as fc from "fast-check";

export const arbitraries = {
	// Primitive types
	string: fc.string(),
	number: fc.float(), // Use float instead of number
	integer: fc.integer(),
	float: fc.float(),
	boolean: fc.boolean(),

	// Collections
	array: <T>(arb: fc.Arbitrary<T>) => fc.array(arb),
	object: <T extends Record<string, any>>(schema: { [K in keyof T]: fc.Arbitrary<T[K]> }) => fc.record(schema),

	// Strings with constraints
	email: fc.emailAddress(),
	url: fc.webUrl(),
	uuid: fc.uuid(),
	date: fc.date(),
	json: fc.jsonValue(),

	// Numeric ranges
	intRange: (min: number, max: number) => fc.integer({ min, max }),
	floatRange: (min: number, max: number) => fc.float({ min, max }),
	positiveInteger: fc.integer({ min: 1 }),
	positiveFloat: fc.float({ min: 0, excludeMin: true }),

	// Common patterns
	nonEmptyString: fc.string({ minLength: 1 }),
	alphaString: fc.stringMatching(/^[a-zA-Z]+$/),
	alphanumericString: fc.stringMatching(/^[a-zA-Z0-9]+$/),

	// Combinators
	oneOf: <T>(...arbs: fc.Arbitrary<T>[]) => fc.oneof(...arbs),
	option: <T>(arb: fc.Arbitrary<T>) => fc.option(arb),
	frequency: <T>(...pairs: Array<[number, fc.Arbitrary<T>]>) => fc.constantFrom(...pairs), // Use constantFrom

	// Recursive structures
	recursive: <T>(
		base: fc.Arbitrary<T>,
		recurse: (self: () => fc.Arbitrary<T>) => fc.Arbitrary<T>,
		maxDepth: number = 3,
	) => {
		// Simple recursive implementation
		let depth = 0;
		const self = () => {
			if (depth >= maxDepth) return base;
			depth++;
			return recurse(self);
		};
		return self();
	},

	// Filtered and mapped
	filter: <T>(arb: fc.Arbitrary<T>, predicate: (value: T) => boolean) => arb.filter(predicate),
	map: <T, U>(arb: fc.Arbitrary<T>, mapper: (value: T) => U) => arb.map(mapper),
	chain: <T, U>(arb: fc.Arbitrary<T>, mapper: (value: T) => fc.Arbitrary<U>) => arb.chain(mapper),

	// Shrink strategies
	shrinkTowards: <T>(value: T) => fc.constant(value),
	noShrink: <T>(arb: fc.Arbitrary<T>) => arb, // Simplified
};
