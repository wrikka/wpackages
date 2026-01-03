import { Effect, Context, Layer, Data } from "effect"
import { Command } from "@wpackages/types"

export class ParseError extends Data.TaggedError("ParseError")<{ 
  readonly message: string 
}> {}

export class ParserService extends Context.Tag("ParserService")<
  ParserService,
  {
    readonly parse: (input: string) => Effect.Effect<Command, ParseError>
  }
>() {}

export const ParserServiceLive = Layer.succeed(
  ParserService,
  ParserService.of({
    parse: (input) =>
      Effect.gen(function*() {
        const parts: string[] = []
        // Regex to match words or quoted strings (handles double quotes)
        const regex = /"([^"]*)"|(\S+)/g
        let match

        while ((match = regex.exec(input)) !== null) {
          // `match[1]` is the content of the double-quoted string
          // `match[2]` is the unquoted word
          parts.push(match[1] ?? match[2])
        }

        if (parts.length === 0) {
          return yield* new ParseError({ message: "Input cannot be empty" })
        }

        const [name, ...args] = parts
        return new Command({ name, args })
      }),
  })
)
