import { Effect, Context, Data } from "effect"
import { Command } from "@wpackages/types"

// A union type for all possible values a command can return.
// For now, it can be a simple string, a table structure, or nothing.
export type ShellValue = string | { readonly type: 'table'; readonly data: ReadonlyArray<Record<string, any>> } | void

// Represents a built-in command that can be executed by the shell.
export interface BuiltinCommand {
  readonly name: string
  readonly execute: (
    args: ReadonlyArray<string>
  ) => Effect.Effect<ShellValue, Error> // Can now return a value and fail.
}

export class CommandNotFound extends Data.TaggedError("CommandNotFound")<{ 
  readonly commandName: string 
}> {}

// The CommandService provides a way to look up commands.
export class CommandService extends Context.Tag("CommandService")<
  CommandService,
  {
    readonly lookup: (
      command: Command
    ) => Effect.Effect<BuiltinCommand, CommandNotFound>
  }
>() {}
