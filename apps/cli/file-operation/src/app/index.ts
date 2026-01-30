import { Effect } from "effect";
import { readTextFile, writeTextFile, removeFile, checkFileExists } from "../services";
import type { FilePath } from "../types";

export const program = Effect.gen(function* () {
  const testPath = "./test-file.txt" as FilePath;

  // Write a test file
  yield* writeTextFile(testPath, "Hello from Bun + Effect-TS!");

  // Read the file
  const content = yield* readTextFile(testPath);
  console.log("File content:", content);

  // Check if file exists
  const exists = yield* checkFileExists(testPath);
  console.log("File exists:", exists);

  // Delete the file
  yield* removeFile(testPath);
  console.log("File deleted successfully");
});
