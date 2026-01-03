import { Effect } from "effect"
import type { BuiltinCommand } from "../command"

export const exit: BuiltinCommand = {
  name: "exit",
  execute: () =>
    Effect.sync(() => {
      process.exit(0)
    }) as Effect.Effect<never, never>, // This effect never completes.
}

