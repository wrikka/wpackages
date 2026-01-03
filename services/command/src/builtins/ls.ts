import { Effect } from "effect"
import type { BuiltinCommand } from "../command"
import * as fs from "node:fs/promises"

export const ls: BuiltinCommand = {
  name: "ls",
  execute: (args) =>
    Effect.gen(function*() {
      const targetPath = args[0] ?? "."

      const dirents = yield* Effect.tryPromise({
        try: () => fs.readdir(targetPath, { withFileTypes: true }),
        catch: (e) => new Error(`ls: cannot access '${targetPath}': ${(e as Error).message}`),
      })

      const data = dirents.map((dirent) => ({
        name: dirent.name,
        type: dirent.isDirectory() ? "dir" : "file",
      }))

      return { type: "table", data } as const
    }),
}

