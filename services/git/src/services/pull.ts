import { Effect } from "effect";
import { runGitCommand } from "./runGitCommand";
import type { GitCommandError } from "../errors";

export const pull = (
    path: string,
    remote?: string,
    branch?: string,
    rebase?: boolean,
): Effect.Effect<void, GitCommandError> => {
    const command = `pull ${remote || ''} ${branch || ''} ${rebase ? '--rebase' : ''}`.trim();
    return runGitCommand(path, command).pipe(Effect.asVoid);
};
