// ============================================================
// Schema Library - Barrel Export
// ============================================================
// Better than Zod & Effect Schema
// Features: Zero deps, <5KB bundle, fluent API, full type inference
// ============================================================

// Types
export type {
	Infer,
	InferIn,
	InferShape,
	ParseContext,
	SafeParseFailure,
	SafeParseResult,
	SafeParseSuccess,
	SchemaIssue,
	SchemaShape,
	Transform,
	Validator,
} from "./types";

// Base classes
export { AsyncSchema, Schema, SchemaParseError } from "./lib/base";

// Utilities
export { createParseContext, EMAIL_REGEX, URL_REGEX, UUID_REGEX } from "./utils";
export {
	assert,
	custom,
	type DeepPartial,
	type DeepRequired,
	type Infer,
	type InferIn,
	is,
	parseWithFallback,
} from "./utils/helpers";

// Primitive schemas
export { BigIntSchema } from "./lib/schemas/bigint";
export { BooleanSchema } from "./lib/schemas/boolean";
export { DateSchema } from "./lib/schemas/date";
export { NumberSchema } from "./lib/schemas/number";
export { StringSchema } from "./lib/schemas/string";
export { SymbolSchema } from "./lib/schemas/symbol";

// Complex schemas
export { ArraySchema } from "./lib/schemas/array";
export { ObjectSchema } from "./lib/schemas/object";
export { RecordSchema } from "./lib/schemas/record";
export { TupleSchema } from "./lib/schemas/tuple";

// Union/Intersection schemas
export { DiscriminatedUnionSchema } from "./lib/schemas/discriminated-union";
export { IntersectionSchema } from "./lib/schemas/intersection";
export { UnionSchema } from "./lib/schemas/union";

// Lazy/Recursive
export { LazySchema } from "./lib/schemas/lazy";

// Preprocess & Pipeline
export { PipelineSchema } from "./lib/schemas/pipeline";
export { PreprocessSchema } from "./lib/schemas/preprocess";

// Schema modifiers
export {
	catch_ as catch,
	type ErrorMap,
	passthrough,
	strict,
	strip,
	superRefine,
	withCustomErrors,
} from "./utils/schema-modifiers";

// Literal/Enum schemas
export { EnumSchema } from "./lib/schemas/enum";
export { LiteralSchema } from "./lib/schemas/literal";

// Special schemas
export { AnySchema, NeverSchema, UnknownSchema } from "./lib/schemas/special";

// Coerce schemas
export { CoerceBooleanSchema, CoerceNumberSchema, CoerceStringSchema } from "./lib/schemas/coerce";

// Factory
export { type S, s } from "./lib/factory";

// Default export
export { s as default } from "./lib/factory";
