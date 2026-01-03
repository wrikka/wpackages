import { Effect } from "effect";
import { runGitCommand } from "./runGitCommand";
import type { GitCommandError } from "../errors";

export const fetch = (
    path: string,
    remote?: string,
    branch?: string,
): Effect.Effect<void, GitCommandError> => {
    const command = `fetch ${remote || ''} ${branch || ''}`.trim();
    return runGitCommand(path, command).pipe(Effect.asVoid);
};
