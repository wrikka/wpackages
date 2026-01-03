import { Effect } from "effect";
import { runGitCommand } from "./runGitCommand";
import type { GitCommandError } from "../errors";

export const push = (
    path: string,
    remote?: string,
    branch?: string,
    force?: boolean,
): Effect.Effect<void, GitCommandError> => {
    const command = `push ${remote || ''} ${branch || ''} ${force ? '--force' : ''}`.trim();
    return runGitCommand(path, command).pipe(Effect.asVoid);
};
