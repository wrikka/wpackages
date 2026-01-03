import { Effect, Context, Layer, Data } from "effect"
import { Command } from "@wpackages/types"
import { CommandService } from "@wpackages/command"
import { DisplayService } from "./display.service"

export class ExecuteError extends Data.TaggedError("ExecuteError")<{ 
  readonly message: string 
}> {}

export class ExecutorService extends Context.Tag("ExecutorService")<
  ExecutorService,
  {
    readonly execute: (command: Command) => Effect.Effect<void, ExecuteError>
  }
>() {}

export const ExecutorServiceLive = Layer.effect(
  ExecutorService,
  Effect.gen(function*() {
    const commandService = yield* CommandService
    const displayService = yield* DisplayService

    const executeExternalCommand = (command: Command) =>
      Effect.tryPromise({
        try: async () => {
          const proc = Bun.spawn([command.name, ...command.args], {
            stdout: "inherit",
            stderr: "inherit",
          })
          await proc.exited
        },
        catch: (e) => new ExecuteError({ message: `Failed to execute command: ${e}` }),
      })

    return ExecutorService.of({
      execute: (command) =>
        commandService.lookup(command).pipe(
          Effect.flatMap((builtin) => builtin.execute(command.args)),
          Effect.flatMap((value) => displayService.display(value)),
          Effect.catchTag("CommandNotFound", () => executeExternalCommand(command)),
          Effect.catchAll((e) => displayService.display(e.message))
        ),
    })
  })
)


