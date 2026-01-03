import { Effect } from "effect"
import { ConsoleService } from "@wpackages/console"
import { ParserService } from "./services/parser.service"
import { ExecutorService } from "./services/executor.service"

const main = Effect.gen(function*() {
  const console = yield* ConsoleService
  const parser = yield* ParserService
  const executor = yield* ExecutorService

  yield* console.log("Welcome to wshell!")

  const processCommand = (input: string) =>
    Effect.gen(function*() {
      if (input.toLowerCase() === "exit") {
        yield* console.log("Goodbye!")
        process.exit(0)
      }

      const command = yield* parser.parse(input)
      yield* executor.execute(command)
    }).pipe(
      Effect.catchTags({
        ParseError: (e) => console.log(`Parse Error: ${e.message}`),
        ExecuteError: (e) => console.log(`Execution Error: ${e.message}`),
      })
    )

  const loop = Effect.gen(function*() {
    const input = yield* console.readLine("> ")
    yield* processCommand(input)
  }).pipe(Effect.forever)

  yield* loop
})

export { main }

