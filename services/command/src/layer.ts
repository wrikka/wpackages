import { Effect, Layer } from "effect"
import { BuiltinCommand, CommandService, CommandNotFound } from "./command"

// A simple implementation of the CommandService that stores built-in commands in a map.
export const CommandServiceLive = (builtins: ReadonlyArray<BuiltinCommand>) =>
  Layer.succeed(
    CommandService,
    CommandService.of({
      lookup: (command) =>
        Effect.gen(function*() {
          const builtin = builtins.find((b) => b.name === command.name)
          if (builtin) {
            return builtin
          }
          return yield* new CommandNotFound({ commandName: command.name })
        }),
    })
  )
