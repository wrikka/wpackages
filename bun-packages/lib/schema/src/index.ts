// ============================================================
// Schema Library - Barrel Export
// ============================================================
// Better than Zod & Effect Schema
// Features: Zero deps, <5KB bundle, fluent API, full type inference
// ============================================================

// Core types
export type {
	Infer,
	InferIn,
	SafeParseResult,
	SchemaIssue,
} from './types';

// Core schemas
export {
	StringSchema,
	NumberSchema,
	BooleanSchema,
	UnknownSchema,
} from './lib/core-schemas';

// Fluent API
export { FluentSchema } from './lib/fluent-schema';

// Typed schema builder
export { s, Infer as InferType } from './lib/typed-schema';

// Schema composition
export {
	union,
	intersection,
	lazy,
} from './lib/schema-composition';

// Custom validation
export {
	ValidatedSchema,
	validators,
} from './lib/custom-validation';

// Transform pipeline
export {
	TransformSchema,
	transforms,
} from './lib/transform-pipeline';

// Async validation
export {
	AsyncSchema,
	toAsync,
	asyncValidators,
} from './lib/async-validation';

// Error handling
export {
	errorBuilder,
	errorTemplates,
	createError,
} from './lib/detailed-errors';

// Minimal factory for ultra-light bundles
export {
	string,
	number,
	boolean,
	unknown,
	schema,
} from './lib/minimal-factory';

// Default export
export { s as default } from './lib/typed-schema';
