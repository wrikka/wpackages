import { Effect } from "effect"
import type { BuiltinCommand } from "../command"

export const help: BuiltinCommand = {
  name: "help",
  execute: () =>
    Effect.succeed(
      "Welcome to wshell! Available commands: exit, help, echo, ls"
    ),
}

