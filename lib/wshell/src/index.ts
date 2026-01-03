import { Effect, Layer } from "effect"
import { main } from "./app"
import { ConsoleServiceLive } from "@wpackages/console"
import { ParserServiceLive } from "./services/parser.service"
import { ExecutorServiceLive } from "./services/executor.service"
import { DisplayServiceLive } from "./services/display.service"
import { CommandServiceLive, all as allBuiltins } from "@wpackages/command"

// Create a layer for the CommandService with all built-in commands.
const CommandLive = CommandServiceLive(allBuiltins)

// Compose all the service layers together.
const DisplayLive = Layer.provide(
    DisplayServiceLive,
    ConsoleServiceLive
)

const ServicesLive = Layer.provide(
    ExecutorServiceLive,
    Layer.mergeAll(CommandLive, DisplayLive)
)

const AppLive = Layer.mergeAll(
    ServicesLive,
    ConsoleServiceLive,
    ParserServiceLive,
    CommandLive,
    DisplayLive
)

const runnable = main.pipe(Effect.provide(AppLive))

Effect.runPromise(runnable)



