import { Schema } from "@effect/schema";
import * as CONST from "../constant/bench.const";

/**
 * Benchmark configuration schema
 */

export type BenchmarkConfig = {
	readonly iterations: number;
	readonly warmup: number;
	readonly timeout: number;
	readonly minSamples: number;
	readonly maxSamples: number;
	readonly confidenceLevel: 0.95 | 0.99;
};

export const BenchmarkConfig: Schema.Schema<BenchmarkConfig> = Schema.Struct({
	iterations: Schema.Number.pipe(Schema.positive()),
	warmup: Schema.Number.pipe(Schema.nonNegative()),
	timeout: Schema.Number.pipe(Schema.positive()),
	minSamples: Schema.Number.pipe(Schema.positive()),
	maxSamples: Schema.Number.pipe(Schema.positive()),
	confidenceLevel: Schema.Literal(0.95, 0.99).pipe(
		Schema.annotations({ default: 0.95 }),
	),
});

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

export type ReporterConfig = {
	readonly format: "console" | "json" | "markdown" | "html" | "csv";
	readonly colors: boolean;
	readonly verbose: boolean;
};

export const ReporterConfig: Schema.Schema<ReporterConfig> = Schema.Struct({
	format: Schema.Literal("console", "json", "markdown", "html", "csv"),
	colors: Schema.Boolean,
	verbose: Schema.Boolean,
});

/**
 * Default reporter configuration
 */
export const DEFAULT_REPORTER_CONFIG: ReporterConfig = {
	format: "console",
	colors: true,
	verbose: false,
};
