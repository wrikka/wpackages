import { Schema } from "@effect/schema";
import * as CONST from "../constant/bench.const";

/**
 * Benchmark configuration schema
 */
export const BenchmarkConfig = Schema.Struct({
	iterations: Schema.Number.pipe(Schema.positive()),
	warmup: Schema.Number.pipe(Schema.nonNegative()),
	timeout: Schema.Number.pipe(Schema.positive()),
	minSamples: Schema.Number.pipe(Schema.positive()),
	maxSamples: Schema.Number.pipe(Schema.positive()),
	confidenceLevel: Schema.Literal(0.95, 0.99).pipe(
		Schema.annotations({ default: 0.95 }),
	),
});

export type BenchmarkConfig = Schema.Schema.Type<typeof BenchmarkConfig>;

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: BenchmarkConfig = {
	iterations: CONST.DEFAULT_ITERATIONS,
	warmup: CONST.DEFAULT_WARMUP,
	timeout: CONST.DEFAULT_TIMEOUT,
	minSamples: CONST.DEFAULT_MIN_SAMPLES,
	maxSamples: CONST.DEFAULT_MAX_SAMPLES,
	confidenceLevel: 0.95,
};

/**
 * Reporter configuration schema
 */
export const ReporterConfig = Schema.Struct({
	format: Schema.Literal("console", "json", "markdown", "html", "csv"),
	colors: Schema.Boolean,
	verbose: Schema.Boolean,
});

export type ReporterConfig = Schema.Schema.Type<typeof ReporterConfig>;

/**
 * Default reporter configuration
 */
export const DEFAULT_REPORTER_CONFIG: ReporterConfig = {
	format: "console",
	colors: true,
	verbose: false,
};
