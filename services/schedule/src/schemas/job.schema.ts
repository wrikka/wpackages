import { Schema } from "effect";

export const CreateJobSchema = Schema.Struct({
	name: Schema.String,
	cron: Schema.String,
	priority: Schema.optional(
		Schema.Literal("low", "normal", "high", "critical"),
	),
	retryConfig: Schema.optional(
		Schema.Struct({
			maxRetries: Schema.Number,
			backoffStrategy: Schema.Literal("fixed", "exponential", "linear"),
			initialDelay: Schema.Number,
			maxDelay: Schema.Number,
			backoffMultiplier: Schema.Number,
		}),
	),
	timeout: Schema.optional(Schema.Number),
	concurrency: Schema.optional(Schema.Number),
	data: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
});

export const UpdateJobSchema = Schema.Struct({
	enabled: Schema.optional(Schema.Boolean),
	cron: Schema.optional(Schema.String),
	priority: Schema.optional(
		Schema.Literal("low", "normal", "high", "critical"),
	),
	retryConfig: Schema.optional(
		Schema.Struct({
			maxRetries: Schema.Number,
			backoffStrategy: Schema.Literal("fixed", "exponential", "linear"),
			initialDelay: Schema.Number,
			maxDelay: Schema.Number,
			backoffMultiplier: Schema.Number,
		}),
	),
	timeout: Schema.optional(Schema.Number),
	concurrency: Schema.optional(Schema.Number),
	data: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
});
