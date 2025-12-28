import { Schema } from '@effect/schema';

// Schema for a single command-line option
export const OptionSchema = Schema.Struct({
  name: Schema.String, // e.g., --port
  shorthand: Schema.optional(Schema.String), // e.g., -p
  description: Schema.optional(Schema.String),
  defaultValue: Schema.optional(Schema.Union(Schema.String, Schema.Boolean, Schema.Number)),
  required: Schema.optional(Schema.Boolean),
});

// Define a self-referencing interface for the Command type
export interface Command {
  readonly name: string;
  readonly description?: string | undefined;
  readonly options?: ReadonlyArray<Schema.Schema.Type<typeof OptionSchema>> | undefined;
  readonly action?: ((args: Record<string, any>) => void) | undefined;
  readonly before?: ((args: Record<string, any>) => void | Promise<void>) | undefined;
  readonly after?: ((args: Record<string, any>) => void | Promise<void>) | undefined;
  readonly subCommands?: ReadonlyArray<Command> | undefined;
}

export const CommandSchema: Schema.Schema<Command> = Schema.suspend(() => Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.String),
  options: Schema.optional(Schema.Array(OptionSchema)),
  // Action and hooks are functions, so we use Any
  action: Schema.optional(Schema.Any as Schema.Schema<(args: Record<string, any>) => void>),
  before: Schema.optional(Schema.Any as Schema.Schema<(args: Record<string, any>) => void | Promise<void>>),
  after: Schema.optional(Schema.Any as Schema.Schema<(args: Record<string, any>) => void | Promise<void>>),
  // Use suspend for recursive schemas
  subCommands: Schema.optional(Schema.Array(CommandSchema)),
}));
