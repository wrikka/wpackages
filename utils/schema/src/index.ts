/**
 * @wpackages/schema - A type-safe schema validation library with full type inference and functional API.
 */

export type {
	ArrayOptions,
	Infer,
	Issue,
	NumberOptions,
	ObjectOptions,
	Result,
	Schema,
	SchemaOptions,
	StringOptions,
	ValidationContext,
} from "./types";

export * from "./types/array";
export * from "./types/boolean";
export * from "./types/literal";
export * from "./types/number";
export * from "./types/object";
export * from "./types/optional";
export * from "./types/string";
export * from "./types/union";
export * from "./utils/builder";
export * from "./utils/format-issues";
