import { Schema } from "@effect/schema";
import { Data } from "effect";

/**
 * Benchmark function type
 */
export type BenchFn = () => void | Promise<void>;

/**
 * Reporter format
 */
export const ReporterFormat = Schema.Literal(
	"console",
	"json",
	"markdown",
	"html",
	"csv",
);
export type ReporterFormat = Schema.Schema.Type<typeof ReporterFormat>;

/**
 * Benchmark configuration schema
 */
export const BenchConfig = Schema.Struct({
	name: Schema.String.pipe(Schema.minLength(1)),
	iterations: Schema.Number.pipe(Schema.positive()),
	warmup: Schema.Number.pipe(Schema.nonNegative()),
	timeout: Schema.Number.pipe(Schema.positive()),
	minSamples: Schema.Number.pipe(Schema.positive()),
	maxSamples: Schema.Number.pipe(Schema.positive()),
});
export type BenchConfig = Schema.Schema.Type<typeof BenchConfig>;

/**
 * Statistics schema
 */
export const Statistics = Schema.Struct({
	min: Schema.Number,
	max: Schema.Number,
	mean: Schema.Number,
	median: Schema.Number,
	variance: Schema.Number,
	standardDeviation: Schema.Number,
	marginOfError: Schema.Number,
	relativeMarginOfError: Schema.Number,
});
export type Statistics = Schema.Schema.Type<typeof Statistics>;

/**
 * Benchmark result schema
 */
export const BenchResult = Schema.Struct({
	name: Schema.String,
	iterations: Schema.Number,
	samples: Schema.Number,
	totalTime: Schema.Number,
	averageTime: Schema.Number,
	ops: Schema.Number,
	stats: Statistics,
	timestamps: Schema.Array(Schema.Number),
});
export type BenchResult = Schema.Schema.Type<typeof BenchResult>;

/**
 * Benchmark suite schema
 */
export const BenchSuite = Schema.Struct({
	name: Schema.String,
	benchmarks: Schema.Array(BenchResult),
	totalTime: Schema.Number,
	createdAt: Schema.Date,
});
export type BenchSuite = Schema.Schema.Type<typeof BenchSuite>;

/**
 * Comparison item schema
 */
export const ComparisonItem = Schema.Struct({
	name: Schema.String,
	relativeTo: Schema.Number,
	percentage: Schema.Number,
	ratio: Schema.String,
});
export type ComparisonItem = Schema.Schema.Type<typeof ComparisonItem>;

/**
 * Benchmark comparison schema
 */
export const BenchComparison = Schema.Struct({
	fastest: Schema.String,
	slowest: Schema.String,
	results: Schema.Array(ComparisonItem),
});
export type BenchComparison = Schema.Schema.Type<typeof BenchComparison>;

/**
 * Export options schema
 */
export const ExportOptions = Schema.Struct({
	format: ReporterFormat,
	filePath: Schema.String,
	includeTimestamps: Schema.Boolean.pipe(
		Schema.annotations({ default: false }),
	),
	pretty: Schema.Boolean.pipe(
		Schema.annotations({ default: true }),
	),
});
export type ExportOptions = Schema.Schema.Type<typeof ExportOptions>;

/**
 * Benchmark errors
 */
export class BenchError extends Data.TaggedError("BenchError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
	readonly message: string;
	readonly errors: unknown;
}> {}

export class TimeoutError extends Data.TaggedError("TimeoutError")<{
	readonly message: string;
	readonly duration: number;
}> {}
