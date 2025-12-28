import type { Schema } from '@effect/schema';
import type { CommandSchema, OptionSchema } from './schema';

export type Option = Schema.Schema.Type<typeof OptionSchema>;
export type Command = Schema.Schema.Type<typeof CommandSchema>;

export type Hook = (args: Record<string, any>) => void | Promise<void>;

export type CliConfig = {
  name: string;
  version: string;
  commands: ReadonlyArray<Command>;
  before?: Hook; // Global before hook
  after?: Hook;  // Global after hook
};