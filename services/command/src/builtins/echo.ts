import { Effect } from "effect"
import type { BuiltinCommand } from "../command"

export const echo: BuiltinCommand = {
  name: "echo",
  execute: (args) => Effect.succeed(args.join(" ")),
}

