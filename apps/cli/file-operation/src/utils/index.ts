import { Effect } from "effect";
import type { FilePath, FileContent } from "../types";
import { FileOperationError, FileNotFoundError, PermissionError } from "../error";

export const readFile = (path: FilePath): Effect.Effect<FileContent, FileOperationError> =>
  Effect.tryPromise({
    try: () => Bun.file(path).text(),
    catch: (error: unknown) => {
      if (error instanceof Error && error.message.includes("ENOENT")) {
        return new FileNotFoundError(path, error);
      }
      if (error instanceof Error && error.message.includes("EACCES")) {
        return new PermissionError(path, error);
      }
      return new FileOperationError(`Failed to read file: ${path}`, path, error);
    }
  });

export const writeFile = (
  path: FilePath,
  content: FileContent
): Effect.Effect<void, FileOperationError> =>
  Effect.tryPromise({
    try: () => Bun.write(path, content),
    catch: (error: unknown) => {
      if (error instanceof Error && error.message.includes("EACCES")) {
        return new PermissionError(path, error);
      }
      return new FileOperationError(`Failed to write file: ${path}`, path, error);
    }
  });

export const deleteFile = (path: FilePath): Effect.Effect<void, FileOperationError> =>
  Effect.tryPromise({
    try: () => Bun.file(path).delete(),
    catch: (error: unknown) => {
      if (error instanceof Error && error.message.includes("ENOENT")) {
        return new FileNotFoundError(path, error);
      }
      if (error instanceof Error && error.message.includes("EACCES")) {
        return new PermissionError(path, error);
      }
      return new FileOperationError(`Failed to delete file: ${path}`, path, error);
    }
  });

export const existsFile = (path: FilePath): Effect.Effect<boolean, FileOperationError> =>
  Effect.tryPromise({
    try: () => Bun.file(path).exists(),
    catch: (error: unknown) => {
      return new FileOperationError(`Failed to check file existence: ${path}`, path, error);
    }
  });
