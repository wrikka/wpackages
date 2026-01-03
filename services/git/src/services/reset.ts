import { Effect } from "effect";
import { runGitCommand } from "./runGitCommand";
import type { GitCommandError } from "../errors";

export const reset = (
    path: string,
    mode: "soft" | "mixed" | "hard",
    hash?: string,
): Effect.Effect<void, GitCommandError> => {
    const command = `reset --${mode} ${hash || ''}`.trim();
    return runGitCommand(path, command).pipe(Effect.asVoid);
};
