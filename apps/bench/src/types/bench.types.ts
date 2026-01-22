import { Schema } from "@effect/schema";
import { Data } from "effect";

/**
 * Benchmark function type
 */
export type BenchFn = () => void | Promise<void>;

export type ReporterFormat = "console" | "json" | "markdown" | "html" | "csv";

/**
 * Reporter format
 */
export const ReporterFormat: Schema.Schema<ReporterFormat> = Schema.Literal(
	"console",
	"json",
	"markdown",
	"html",
	"csv",
);

export type BenchConfig = {
	readonly name: string;
	readonly iterations: number;
	readonly warmup: number;
	readonly timeout: number;
	readonly minSamples: number;
	readonly maxSamples: number;
};

/**
 * Benchmark configuration schema
 */
export const BenchConfig: Schema.Schema<BenchConfig> = Schema.Struct({
	name: Schema.String.pipe(Schema.minLength(1)),
	iterations: Schema.Number.pipe(Schema.positive()),
	warmup: Schema.Number.pipe(Schema.nonNegative()),
	timeout: Schema.Number.pipe(Schema.positive()),
	minSamples: Schema.Number.pipe(Schema.positive()),
	maxSamples: Schema.Number.pipe(Schema.positive()),
});

export type Statistics = {
	readonly min: number;
	readonly max: number;
	readonly mean: number;
	readonly median: number;
	readonly variance: number;
	readonly standardDeviation: number;
	readonly marginOfError: number;
	readonly relativeMarginOfError: number;
};

/**
 * Statistics schema
 */
export const Statistics: Schema.Schema<Statistics> = Schema.Struct({
	min: Schema.Number,
	max: Schema.Number,
	mean: Schema.Number,
	median: Schema.Number,
	variance: Schema.Number,
	standardDeviation: Schema.Number,
	marginOfError: Schema.Number,
	relativeMarginOfError: Schema.Number,
});

export type BenchResult = {
	readonly name: string;
	readonly iterations: number;
	readonly samples: number;
	readonly totalTime: number;
	readonly averageTime: number;
	readonly ops: number;
	readonly stats: Statistics;
	readonly timestamps: readonly number[];
};

/**
 * Benchmark result schema
 */
export const BenchResult: Schema.Schema<BenchResult> = Schema.Struct({
	name: Schema.String,
	iterations: Schema.Number,
	samples: Schema.Number,
	totalTime: Schema.Number,
	averageTime: Schema.Number,
	ops: Schema.Number,
	stats: Statistics,
	timestamps: Schema.Array(Schema.Number),
});

export type BenchSuite = {
	readonly name: string;
	readonly benchmarks: readonly BenchResult[];
	readonly totalTime: number;
	readonly createdAt: Date;
};

/**
 * Benchmark suite schema
 */
export const BenchSuite: Schema.Schema<BenchSuite> = Schema.Struct({
	name: Schema.String,
	benchmarks: Schema.Array(BenchResult),
	totalTime: Schema.Number,
	createdAt: Schema.DateFromSelf,
});

export type ComparisonItem = {
	readonly name: string;
	readonly relativeTo: number;
	readonly percentage: number;
	readonly ratio: string;
};

/**
 * Comparison item schema
 */
export const ComparisonItem: Schema.Schema<ComparisonItem> = Schema.Struct({
	name: Schema.String,
	relativeTo: Schema.Number,
	percentage: Schema.Number,
	ratio: Schema.String,
});

export type BenchComparison = {
	readonly fastest: string;
	readonly slowest: string;
	readonly results: readonly ComparisonItem[];
};

/**
 * Benchmark comparison schema
 */
export const BenchComparison: Schema.Schema<BenchComparison> = Schema.Struct({
	fastest: Schema.String,
	slowest: Schema.String,
	results: Schema.Array(ComparisonItem),
});

export type ExportOptions = {
	readonly format: ReporterFormat;
	readonly filePath: string;
	readonly includeTimestamps: boolean;
	readonly pretty: boolean;
};

/**
 * Export options schema
 */
export const ExportOptions: Schema.Schema<ExportOptions> = Schema.Struct({
	format: ReporterFormat,
	filePath: Schema.String,
	includeTimestamps: Schema.Boolean.pipe(
		Schema.annotations({ default: false }),
	),
	pretty: Schema.Boolean.pipe(
		Schema.annotations({ default: true }),
	),
});

/**
 * Benchmark errors
 */
const BenchErrorBase: ReturnType<typeof Data.TaggedError> = Data.TaggedError("BenchError");
const ValidationErrorBase: ReturnType<typeof Data.TaggedError> = Data.TaggedError("ValidationError");
const TimeoutErrorBase: ReturnType<typeof Data.TaggedError> = Data.TaggedError("TimeoutError");

export class BenchError extends BenchErrorBase<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export class ValidationError extends ValidationErrorBase<{
	readonly message: string;
	readonly errors: unknown;
}> {}

export class TimeoutError extends TimeoutErrorBase<{
	readonly message: string;
	readonly duration: number;
}> {}
