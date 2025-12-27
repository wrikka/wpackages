import type { IntegrationError } from "./integration";

type ResultType<T, E> =
	| { success: true; value: T }
	| { success: false; error: E };

/**
 * Data transformer
 */
export type Transformer<TInput = unknown, TOutput = unknown> = (
	input: TInput,
) => ResultType<TOutput, IntegrationError>;

/**
 * Async data transformer
 */
export type AsyncTransformer<TInput = unknown, TOutput = unknown> = (
	input: TInput,
) => Promise<ResultType<TOutput, IntegrationError>>;

/**
 * Transform configuration
 */
export type TransformConfig = {
	readonly removeNull?: boolean;
	readonly removeUndefined?: boolean;
	readonly removeEmpty?: boolean;
	readonly camelCase?: boolean;
	readonly snakeCase?: boolean;
	readonly trim?: boolean;
	readonly strict?: boolean;
};

/**
 * Field mapping
 */
export type FieldMapping = {
	readonly source: string;
	readonly target: string;
	readonly transform?: Transformer;
	readonly required?: boolean;
	readonly defaultValue?: unknown;
};

/**
 * Schema mapping
 */
export type SchemaMapping = {
	readonly fields: readonly FieldMapping[];
	readonly config?: TransformConfig;
};

/**
 * Serializer
 */
export type Serializer<T = unknown> = {
	readonly serialize: (data: T) => ResultType<string, IntegrationError>;
	readonly deserialize: (data: string) => ResultType<T, IntegrationError>;
};

/**
 * Transform pipeline
 */
export type TransformPipeline<TInput = unknown, TOutput = unknown> = {
	readonly transform: (
		input: TInput,
	) => Promise<ResultType<TOutput, IntegrationError>>;
	readonly addStep: <TIntermediate>(
		transformer: AsyncTransformer<TOutput, TIntermediate>,
	) => TransformPipeline<TInput, TIntermediate>;
};

/**
 * Normalization options
 */
export type NormalizationOptions = {
	readonly lowercase?: boolean;
	readonly uppercase?: boolean;
	readonly trim?: boolean;
	readonly removeWhitespace?: boolean;
	readonly removeSpecialChars?: boolean;
};

/**
 * Format type
 */
export type FormatType = "json" | "xml" | "csv" | "yaml" | "form-data";

/**
 * Format converter
 */
export type FormatConverter = {
	readonly from: FormatType;
	readonly to: FormatType;
	readonly convert: (data: string) => ResultType<string, IntegrationError>;
};
