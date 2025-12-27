import { Schema } from "effect";

/**
 * Script configuration schema
 */
export const ScriptSchema = Schema.Struct({
	name: Schema.String,
	description: Schema.optional(Schema.String),
	command: Schema.String,
	cwd: Schema.optional(Schema.String),
	env: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
	parallel: Schema.optional(Schema.Boolean),
	dependencies: Schema.optional(Schema.Array(Schema.String)),
	timeout: Schema.optional(Schema.Number),
	retries: Schema.optional(Schema.Number),
	retryDelay: Schema.optional(Schema.Number),
	dryRun: Schema.optional(Schema.Boolean),
	continueOnError: Schema.optional(Schema.Boolean),
});

export type Script = Schema.Schema.Type<typeof ScriptSchema>;

/**
 * Script execution result
 */
export const ScriptResultSchema = Schema.Struct({
	name: Schema.String,
	success: Schema.Boolean,
	output: Schema.optional(Schema.String),
	error: Schema.optional(Schema.String),
	duration: Schema.Number,
});

export type ScriptResult = Schema.Schema.Type<typeof ScriptResultSchema>;

/**
 * Script runner configuration
 */
export const ScriptRunnerConfigSchema = Schema.Struct({
	scripts: Schema.Record({ key: Schema.String, value: ScriptSchema }),
	parallel: Schema.optional(Schema.Boolean),
	cwd: Schema.optional(Schema.String),
	env: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
});

export type ScriptRunnerConfig = Schema.Schema.Type<
	typeof ScriptRunnerConfigSchema
>;
