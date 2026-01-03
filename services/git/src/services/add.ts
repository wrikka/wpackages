import { Effect } from "effect";
import { runGitCommand } from "./runGitCommand";
import type { GitCommandError } from "../errors";

export const add = (
    path: string,
    files: readonly string[],
): Effect.Effect<void, GitCommandError> =>
    runGitCommand(path, `add ${files.join(' ')}`).pipe(Effect.asVoid);
