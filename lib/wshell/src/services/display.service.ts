import { Effect, Context, Layer } from "effect"
import { ShellValue } from "@wpackages/command"
import { ConsoleService } from "@wpackages/console"

export class DisplayService extends Context.Tag("DisplayService")<
  DisplayService,
  {
    readonly display: (value: ShellValue) => Effect.Effect<void, never>
  }
>() {}

export const DisplayServiceLive = Layer.effect(
  DisplayService,
  Effect.gen(function*() {
    const console = yield* ConsoleService

    const displayTable = (data: ReadonlyArray<Record<string, any>>) =>
      Effect.sync(() => {
        if (data.length === 0) {
          return
        }
        // A simple table display. We can use a library like `cli-table3` later.
        console.log(Object.keys(data[0]).join("\t"))
        data.forEach((row) => {
          console.log(Object.values(row).join("\t"))
        })
      })

    return DisplayService.of({
      display: (value) =>
        Effect.gen(function*() {
          if (typeof value === "string") {
            yield* console.log(value)
          } else if (value && value.type === "table") {
            yield* displayTable(value.data)
          }
          // If value is void or unhandled, do nothing.
        }),
    })
  })
)
