/**
 * Ultra-minimal schema factory
 * Bundle size: < 3KB target
 */

import { StringSchema, NumberSchema, BooleanSchema, UnknownSchema } from "./core-schemas";

/**
 * Create string schema
 */
export function string(): StringSchema {
	return new StringSchema();
}

/**
 * Create number schema
 */
export function number(): NumberSchema {
	return new NumberSchema();
}

/**
 * Create boolean schema
 */
export function boolean(): BooleanSchema {
	return new BooleanSchema();
}

/**
 * Create unknown schema
 */
export function unknown(): UnknownSchema {
	return new UnknownSchema();
}

/**
 * Schema factory object
 */
export const schema = {
	string,
	number,
	boolean,
	unknown,
};

// Default export
export default schema;
