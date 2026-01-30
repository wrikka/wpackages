#!/usr/bin/env bun
import { Effect } from "effect";
import { readTextFile, writeTextFile, removeFile, checkFileExists } from "../services";
import type { FilePath, FileContent } from "../types";

const args = Bun.argv.slice(2);

const command = args[0];
const path = args[1] as FilePath;
const content = args[2] as FileContent;

const program = Effect.gen(function* () {
  switch (command) {
    case "read": {
      const text = yield* readTextFile(path);
      console.log(text);
      break;
    }
    case "write": {
      if (!content) {
        console.error("Error: Content is required for write command");
        process.exit(1);
      }
      yield* writeTextFile(path, content);
      console.log(`Successfully wrote to ${path}`);
      break;
    }
    case "delete": {
      yield* removeFile(path);
      console.log(`Successfully deleted ${path}`);
      break;
    }
    case "exists": {
      const exists = yield* checkFileExists(path);
      console.log(`File exists: ${exists}`);
      break;
    }
    default: {
      console.error("Unknown command:", command);
      console.log(`
Usage: bun run src/cli/index.ts <command> <path> [content]

Commands:
  read <path>           - Read file content
  write <path> <content> - Write content to file
  delete <path>          - Delete file
  exists <path>         - Check if file exists
      `);
      process.exit(1);
    }
  }
});

void Effect.runPromiseExit(program).then((exit) => {
  if (exit._tag === "Failure") {
    console.error("Error:", exit.cause);
    process.exit(1);
  }
});
