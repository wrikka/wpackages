import type { Schema } from "../types";
import { ArraySchema } from "./schemas/array";
import { BigIntSchema } from "./schemas/bigint";
import { BooleanSchema } from "./schemas/boolean";
import { CoerceBooleanSchema, CoerceNumberSchema, CoerceStringSchema } from "./schemas/coerce";
import { DateSchema } from "./schemas/date";
import { DiscriminatedUnionSchema } from "./schemas/discriminated-union";
import { EnumSchema } from "./schemas/enum";
import { IntersectionSchema } from "./schemas/intersection";
import { LazySchema } from "./schemas/lazy";
import { LiteralSchema } from "./schemas/literal";
import { NumberSchema } from "./schemas/number";
import { ObjectSchema, type SchemaShape } from "./schemas/object";
import { RecordSchema } from "./schemas/record";
import { AnySchema, NeverSchema, UnknownSchema } from "./schemas/special";
import { StringSchema } from "./schemas/string";
import { SymbolSchema } from "./schemas/symbol";
import { TupleSchema } from "./schemas/tuple";
import { UnionSchema } from "./schemas/union";

/**
 * Schema factory type
 */
export interface S {
	string: () => StringSchema;
	number: () => NumberSchema;
	bigint: () => BigIntSchema;
	boolean: () => BooleanSchema;
	date: () => DateSchema;
	symbol: () => SymbolSchema;
	literal: <T extends string | number | boolean | null | undefined | bigint>(value: T) => LiteralSchema<T>;
	enum: <T extends Record<string, string | number>>(enumObj: T) => EnumSchema<T>;
	object: <T extends SchemaShape>(shape: T) => ObjectSchema<T>;
	array: <T>(itemSchema: Schema<T>) => ArraySchema<T>;
	tuple: <T extends readonly unknown[]>(...schemas: { [K in keyof T]: Schema<T[K]> }) => TupleSchema<T>;
	record: <K extends string | number, V>(keySchema: Schema<K>, valueSchema: Schema<V>) => RecordSchema<K, V>;
	union: <T extends readonly Schema<unknown>[]>(...schemas: T) => UnionSchema<T>;
	or: <T extends readonly Schema<unknown>[]>(...schemas: T) => UnionSchema<T>;
	discriminatedUnion: <D extends string, T extends Record<D, string | number | boolean> & Record<string, unknown>>(
		discriminator: D,
		variants: { [K in T[D]]: Schema<T & Record<D, K>> },
	) => DiscriminatedUnionSchema<D, T>;
	intersection: <T extends Schema<unknown>, U extends Schema<unknown>>(left: T, right: U) => IntersectionSchema<T, U>;
	and: <T extends Schema<unknown>, U extends Schema<unknown>>(left: T, right: U) => IntersectionSchema<T, U>;
	lazy: <T>(getter: () => Schema<T>) => LazySchema<T>;
	coerce: {
		string: () => CoerceStringSchema;
		number: () => CoerceNumberSchema;
		boolean: () => CoerceBooleanSchema;
		date: () => DateSchema;
	};
	undefined: () => LiteralSchema<undefined>;
	null: () => LiteralSchema<null>;
	void: () => LiteralSchema<undefined>;
	any: () => AnySchema;
	unknown: () => UnknownSchema;
	never: () => NeverSchema;
}

/**
 * Schema factory - creates schema instances
 */
export const s: S = {
	// Primitives
	string: () => new StringSchema(),
	number: () => new NumberSchema(),
	bigint: () => new BigIntSchema(),
	boolean: () => new BooleanSchema(),
	date: () => new DateSchema(),
	symbol: () => new SymbolSchema(),

	// Literals
	literal: <T extends string | number | boolean | null | undefined | bigint>(value: T) => new LiteralSchema(value),
	enum: <T extends Record<string, string | number>>(enumObj: T) => new EnumSchema(enumObj),

	// Complex
	object: <T extends SchemaShape>(shape: T) => new ObjectSchema(shape),
	array: <T>(itemSchema: Schema<T>) => new ArraySchema(itemSchema),
	tuple: <T extends readonly unknown[]>(...schemas: { [K in keyof T]: Schema<T[K]> }) => new TupleSchema(schemas),
	record: <K extends string | number, V>(keySchema: Schema<K>, valueSchema: Schema<V>) =>
		new RecordSchema(keySchema, valueSchema),

	// Unions
	union: <T extends readonly Schema<unknown>[]>(...schemas: T) => new UnionSchema(schemas),
	or: <T extends readonly Schema<unknown>[]>(...schemas: T) => new UnionSchema(schemas),
	discriminatedUnion: <D extends string, T extends Record<D, string | number | boolean> & Record<string, unknown>>(
		discriminator: D,
		variants: { [K in T[D]]: Schema<T & Record<D, K>> },
	) => new DiscriminatedUnionSchema(discriminator, variants),

	// Intersection
	intersection: <T extends Schema<unknown>, U extends Schema<unknown>>(left: T, right: U) =>
		new IntersectionSchema(left, right),
	and: <T extends Schema<unknown>, U extends Schema<unknown>>(left: T, right: U) => new IntersectionSchema(left, right),

	// Lazy/Recursive
	lazy: <T>(getter: () => Schema<T>) => new LazySchema(getter),

	// Coerce
	coerce: {
		string: () => new CoerceStringSchema(),
		number: () => new CoerceNumberSchema(),
		boolean: () => new CoerceBooleanSchema(),
		date: () => new DateSchema(),
	},

	// Special
	undefined: () => new LiteralSchema(undefined),
	null: () => new LiteralSchema(null),
	void: () => new LiteralSchema(undefined),
	any: () => new AnySchema(),
	unknown: () => new UnknownSchema(),
	never: () => new NeverSchema(),
};

export default s;
