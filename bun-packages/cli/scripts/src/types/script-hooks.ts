import { Schema } from "effect";

/**
 * Script hooks - callbacks executed at different stages of script execution
 */
export const ScriptHooksSchema = Schema.Struct({
	beforeRun: Schema.optional(Schema.String),
	afterRun: Schema.optional(Schema.String),
	onError: Schema.optional(Schema.String),
});

export type ScriptHooks = Schema.Schema.Type<typeof ScriptHooksSchema>;

/**
 * Advanced script options
 */
export const ScriptAdvancedOptionsSchema = Schema.Struct({
	timeout: Schema.optional(Schema.Number),
	retries: Schema.optional(Schema.Number),
	retryDelay: Schema.optional(Schema.Number),
	dryRun: Schema.optional(Schema.Boolean),
	continueOnError: Schema.optional(Schema.Boolean),
	hooks: Schema.optional(ScriptHooksSchema),
});

export type ScriptAdvancedOptions = Schema.Schema.Type<
	typeof ScriptAdvancedOptionsSchema
>;
